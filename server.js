import express from 'express';
import jsonServer from 'json-server';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = express();

const dbDir = process.env.GOODFILM_DATA_DIR || path.join(__dirname, 'data');
const publicDir = process.env.GOODFILM_PUBLIC_DIR || path.join(__dirname, 'public');
const backupDir = process.env.GOODFILM_BACKUP_DIR || path.join(__dirname, 'backups');
const dbPath = path.join(dbDir, 'database.json');
const initialDbPath = path.join(__dirname, 'db.json');
const legacyDbPath = path.join(__dirname, 'database.json');
const recoveryMarkerPath = path.join(backupDir, 'test-report-recovery-v1.json');
const MAX_BACKUPS = 60;

fs.mkdirSync(dbDir, { recursive: true });
fs.mkdirSync(publicDir, { recursive: true });
fs.mkdirSync(backupDir, { recursive: true });

const isValidDatabase = (filePath) => {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const requiredCollections = ['banners', 'downloads', 'groups', 'series', 'models', 'portfolio'];
    return data && typeof data === 'object' && !Array.isArray(data)
      && requiredCollections.every(name => Array.isArray(data[name]));
  } catch {
    return false;
  }
};

const getValidBackups = () => fs.readdirSync(backupDir)
  .filter(name => name.startsWith('database-') && name.endsWith('.json'))
  .map(name => path.join(backupDir, name))
  .filter(isValidDatabase)
  .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);

const restoreDatabaseIfNeeded = () => {
  if (fs.existsSync(dbPath) && isValidDatabase(dbPath)) return;

  if (fs.existsSync(dbPath)) {
    fs.copyFileSync(dbPath, path.join(backupDir, `database-corrupt-${Date.now()}.json`));
  }

  const recoverySource = [...getValidBackups(), legacyDbPath, initialDbPath]
    .find(candidate => fs.existsSync(candidate) && isValidDatabase(candidate));

  if (!recoverySource) {
    throw new Error('No valid database or backup is available.');
  }

  fs.copyFileSync(recoverySource, dbPath);
  console.log(`Database restored from ${recoverySource}`);
};

restoreDatabaseIfNeeded();

const createDatabaseBackup = (reason = 'scheduled') => {
  if (!fs.existsSync(dbPath) || !isValidDatabase(dbPath)) return null;

  const safeReason = reason.replace(/[^a-z0-9_-]/gi, '-');
  const backupPath = path.join(backupDir, `database-${Date.now()}-${safeReason}.json`);
  fs.copyFileSync(dbPath, backupPath);

  getValidBackups().slice(MAX_BACKUPS).forEach(filePath => fs.unlinkSync(filePath));
  return backupPath;
};

const router = jsonServer.router(dbPath);
const middlewares = jsonServer.defaults();

// Setup storage
const getDirByCategory = (category) => {
  switch (category) {
    case 'manual': return 'manual';
    case 'spec': return 'data_sheet';
    case 'test_report': return 'test_report';
    case 'other': return 'other';
    case 'catalog':
    default: return 'e-catalog';
  }
};

const validCategories = new Set(['catalog', 'manual', 'spec', 'test_report', 'other']);
const normalizeCategory = (category) => validCategories.has(category) ? category : 'catalog';

const fileTitle = (filename) => filename
  .replace(/^\d{10,}-/, '')
  .replace(/\.[^.]+$/, '')
  .replace(/[-_]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const getOrphanDownloads = (category = 'test_report') => {
  const safeCategory = normalizeCategory(category);
  const folderName = getDirByCategory(safeCategory);
  const folderPath = path.join(publicDir, 'download', folderName);
  if (!fs.existsSync(folderPath)) return [];

  const downloads = router.db.get('downloads').value() || [];
  const referencedFiles = new Set(downloads
    .map(item => String(item.file || '').replace(/\\/g, '/').toLowerCase()));

  return fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(entry => entry.isFile() && /\.(pdf|png|jpe?g)$/i.test(entry.name))
    .map(entry => {
      const fileUrl = `/download/${folderName}/${entry.name}`;
      const stat = fs.statSync(path.join(folderPath, entry.name));
      const ext = path.extname(entry.name).slice(1).toUpperCase().replace('JPEG', 'JPG');
      return {
        filename: entry.name,
        title: fileTitle(entry.name),
        category: safeCategory,
        ext,
        info: `${ext}  ${(stat.size / (1024 * 1024)).toFixed(1)} MB`,
        file: fileUrl,
        modifiedAt: stat.mtime.toISOString(),
        isValidSize: stat.size >= 1024,
        isOrphan: !referencedFiles.has(fileUrl.toLowerCase())
      };
    })
    .filter(item => item.isOrphan && item.isValidSize);
};

const recoverOrphanDownloads = (category = 'test_report', reason = 'manual-recovery') => {
  const orphanFiles = getOrphanDownloads(category);
  if (orphanFiles.length === 0) return [];

  createDatabaseBackup(reason);
  const now = Date.now();
  const recovered = orphanFiles.map((item, index) => ({
    id: `${now}-${index}`,
    title: item.title || `Recovered ${item.ext} file`,
    category: item.category,
    ext: item.ext,
    info: item.info,
    file: item.file,
    seriesId: '',
    recoveredAt: new Date().toISOString()
  }));
  router.db.get('downloads').push(...recovered).write();
  return recovered;
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const category = normalizeCategory(req.body.category);
    const folderName = getDirByCategory(category);
    const destDir = path.join(publicDir, 'download', folderName);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    cb(null, destDir);
  },
  filename: function (req, file, cb) {
    // Handle Thai characters by re-encoding from latin1 to utf8, a common multer workaround
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const safeName = Date.now() + '-' + originalName.replace(/\s+/g, '-');
    cb(null, safeName);
  }
});
const upload = multer({ storage: storage });

server.use(cors());
server.use(middlewares);
server.use(express.static(publicDir));
server.use(express.static(path.join(__dirname, 'dist')));

server.use((req, res, next) => {
  const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
  const isDatabaseRoute = /^\/(banners|downloads|groups|series|models|portfolio)(\/|$)/.test(req.path);
  if (isMutation && isDatabaseRoute) {
    try {
      createDatabaseBackup(`${req.method.toLowerCase()}-${req.path.split('/')[1]}`);
    } catch (error) {
      console.error('Database backup failed:', error);
      return res.status(500).json({ error: 'Database backup failed. No data was changed.' });
    }
  }
  next();
});

// Custom upload endpoint
server.post('/upload-download', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  const category = normalizeCategory(req.body.category);
  const folderName = getDirByCategory(category);
  const fileUrl = `/download/${folderName}/${req.file.filename}`;
  res.json({ url: fileUrl });
});

server.post('/upload-download-and-register', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const category = normalizeCategory(req.body.category);
  const folderName = getDirByCategory(category);
  const fileUrl = `/download/${folderName}/${req.file.filename}`;
  const ext = path.extname(req.file.originalname).slice(1).toUpperCase().replace('JPEG', 'JPG');
  const record = {
    id: Date.now().toString(),
    seriesId: req.body.seriesId || '',
    title: String(req.body.title || fileTitle(req.file.filename)).trim(),
    category,
    ext,
    info: `${ext}  ${(req.file.size / (1024 * 1024)).toFixed(1)} MB`,
    file: fileUrl
  };

  try {
    createDatabaseBackup('upload-download');
    router.db.get('downloads').push(record).write();
    return res.status(201).json({ url: fileUrl, record });
  } catch (error) {
    try {
      fs.unlinkSync(req.file.path);
    } catch (cleanupError) {
      console.error('Could not remove unregistered upload:', cleanupError);
    }
    console.error('Upload registration failed:', error);
    return res.status(500).json({ error: 'The upload could not be registered.' });
  }
});

server.get('/maintenance/orphan-downloads', (req, res) => {
  if (req.query.category && req.query.category !== 'test_report') {
    return res.status(400).json({ error: 'Only Test Report recovery is supported.' });
  }
  const category = 'test_report';
  const files = getOrphanDownloads(category);
  res.json({ category, count: files.length, files });
});

server.post('/maintenance/recover-downloads', (req, res) => {
  if (req.query.category && req.query.category !== 'test_report') {
    return res.status(400).json({ error: 'Only Test Report recovery is supported.' });
  }
  const category = 'test_report';
  try {
    const recovered = recoverOrphanDownloads(category);
    return res.json({ category, count: recovered.length, recovered });
  } catch (error) {
    console.error('Download recovery failed:', error);
    return res.status(500).json({ error: 'Download recovery failed.' });
  }
});

// Portfolio storage
const portfolioDir = path.join(publicDir, 'portfolio');
if (!fs.existsSync(portfolioDir)) {
  fs.mkdirSync(portfolioDir, { recursive: true });
}

const portfolioStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, portfolioDir);
  },
  filename: function (req, file, cb) {
    const safeName = Date.now() + '-' + Math.round(Math.random() * 1E9) + '.jpg';
    cb(null, safeName);
  }
});
const uploadPortfolio = multer({ storage: portfolioStorage });

server.post('/upload-portfolio', uploadPortfolio.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  const fileUrl = `/portfolio/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// Banner storage
const bannerDir = path.join(publicDir, 'banners');
if (!fs.existsSync(bannerDir)) {
  fs.mkdirSync(bannerDir, { recursive: true });
}

const bannerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, bannerDir);
  },
  filename: function (req, file, cb) {
    const safeName = Date.now() + '-' + Math.round(Math.random() * 1E9) + '.jpg';
    cb(null, safeName);
  }
});
const uploadBanner = multer({ storage: bannerStorage });

server.post('/upload-banner', uploadBanner.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  const fileUrl = `/banners/${req.file.filename}`;
  res.json({ url: fileUrl });
});

server.use(router);

try {
  const currentTestReports = router.db.get('downloads').filter({ category: 'test_report' }).value();
  if (!fs.existsSync(recoveryMarkerPath) && currentTestReports.length > 0) {
    fs.writeFileSync(recoveryMarkerPath, JSON.stringify({ status: 'already-present', checkedAt: new Date().toISOString() }, null, 2));
  } else if (!fs.existsSync(recoveryMarkerPath)) {
    const recovered = recoverOrphanDownloads('test_report', 'automatic-test-report-recovery');
    if (recovered.length > 0) {
      fs.writeFileSync(recoveryMarkerPath, JSON.stringify({
        status: 'recovered',
        recoveredAt: new Date().toISOString(),
        count: recovered.length,
        files: recovered.map(item => item.file)
      }, null, 2));
      console.log(`Recovered ${recovered.length} Test Report file(s) from NAS storage.`);
    }
  }
  createDatabaseBackup('startup');
} catch (error) {
  console.error('Startup recovery/backup check failed:', error);
}

// Catch-all route to serve the React application
server.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const port = Number(process.env.PORT || 3001);
server.listen(port, () => {
  console.log(`JSON Server with Multer is running on http://localhost:${port}`);
});
