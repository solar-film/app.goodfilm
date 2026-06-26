import express from 'express';
import jsonServer from 'json-server';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';
import sanitizeHtml from 'sanitize-html';
import helmet from 'helmet';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = express();
server.set('trust proxy', 1);

const loadLocalEnv = () => {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex < 1) continue;
    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^(['"])(.*)\1$/, '$2');
    if (!Object.hasOwn(process.env, key) || process.env[key] === '') {
      process.env[key] = value;
    }
  }
};

loadLocalEnv();

const isProduction = process.env.NODE_ENV === 'production';
const adminPassword = process.env.ADMIN_PASSWORD || (isProduction ? '' : 'goodfilm-admin-local');
const downloadPassword = process.env.DOWNLOAD_PASSWORD || (isProduction ? '' : 'goodfilm');
const sessionSecret = process.env.ADMIN_SESSION_SECRET || (isProduction ? '' : 'goodfilm-local-session-secret-change-before-production');
const sessionCookieName = 'goodfilm_admin_session';
const downloadCookieName = 'goodfilm_download_session';
const sessionDurationMs = 8 * 60 * 60 * 1000;
const defaultAllowedOrigins = [
  'https://goodfilmshop.com',
  'https://www.goodfilmshop.com',
  'https://nas.goodfilmshop.com',
  'https://app.goodfilmshop.com',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];
const allowedOrigins = new Set(
  String(process.env.CORS_ALLOWED_ORIGINS || defaultAllowedOrigins.join(','))
    .split(',')
    .map(origin => origin.trim().replace(/\/$/, ''))
    .filter(Boolean)
);

if (isProduction && (!adminPassword || !downloadPassword || !sessionSecret || sessionSecret.length < 32)) {
  throw new Error('ADMIN_PASSWORD, DOWNLOAD_PASSWORD, and ADMIN_SESSION_SECRET (at least 32 characters) are required in production.');
}

if (!isProduction && !process.env.ADMIN_PASSWORD) {
  console.warn('Using the local-only admin password. Set ADMIN_PASSWORD before production.');
}

const dbDir = process.env.GOODFILM_DATA_DIR || path.join(__dirname, 'data');
const publicDir = process.env.GOODFILM_PUBLIC_DIR || path.join(__dirname, 'public');
const backupDir = process.env.GOODFILM_BACKUP_DIR || path.join(__dirname, 'backups');
const appIndexPath = path.join(__dirname, 'dist', 'index.html');
const dbPath = path.join(dbDir, 'database.json');
const initialDbPath = path.join(__dirname, 'db.json');
const legacyDbPath = path.join(__dirname, 'database.json');
const recoveryMarkerPath = path.join(backupDir, 'test-report-recovery-v1.json');
const MAX_BACKUPS = 60;
const loginAttempts = new Map();

const parseCookies = (header = '') => Object.fromEntries(
  header.split(';').map(part => part.trim()).filter(Boolean).map(part => {
    const separatorIndex = part.indexOf('=');
    if (separatorIndex < 0) return [part, ''];
    return [part.slice(0, separatorIndex), decodeURIComponent(part.slice(separatorIndex + 1))];
  })
);

const safeEqual = (left, right) => {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

const signSession = (expiresAt, scope) => {
  const payload = Buffer.from(JSON.stringify({ expiresAt, scope })).toString('base64url');
  const signature = crypto.createHmac('sha256', sessionSecret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
};

const isValidSession = (token, expectedScope) => {
  try {
    const [payload, signature] = String(token || '').split('.');
    if (!payload || !signature) return false;
    const expected = crypto.createHmac('sha256', sessionSecret).update(payload).digest('base64url');
    if (!safeEqual(signature, expected)) return false;
    const { expiresAt, scope } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return scope === expectedScope && Number(expiresAt) > Date.now();
  } catch {
    return false;
  }
};

const hasAdminSession = (req) => {
  const cookies = parseCookies(req.headers.cookie);
  return isValidSession(cookies[sessionCookieName], 'admin');
};

const hasDownloadSession = (req) => {
  const cookies = parseCookies(req.headers.cookie);
  return isValidSession(cookies[downloadCookieName], 'download');
};

const requireAdmin = (req, res, next) => {
  if (hasAdminSession(req)) return next();
  return res.status(401).json({ error: 'Authentication required.' });
};

const requireDownloadAccess = (req, res, next) => {
  if (hasAdminSession(req) || hasDownloadSession(req)) return next();
  return res.status(401).json({ error: 'Download password required.' });
};

const sanitizeRichText = (value) => sanitizeHtml(String(value || ''), {
  allowedTags: [
    ...sanitizeHtml.defaults.allowedTags,
    'h1', 'h2', 'h3', 'h4', 'img', 'span'
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height'],
    p: ['class'],
    span: ['class']
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }, true)
  }
});

const sanitizeSeriesPayload = (req, _res, next) => {
  if (req.body && typeof req.body === 'object' && Object.hasOwn(req.body, 'longDesc')) {
    req.body.longDesc = sanitizeRichText(req.body.longDesc);
  }
  next();
};

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
const middlewares = [
  jsonServer.bodyParser,
  (_req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache');
    next();
  }
];

// Setup storage
const getDirByCategory = (category) => {
  switch (category) {
    case 'manual': return 'manual';
    case 'spec': return 'data_sheet';
    case 'test_report': return 'test_report';
    case 'reference': return 'reference';
    case 'other': return 'other';
    case 'catalog':
    default: return 'e-catalog';
  }
};

const validCategories = new Set(['catalog', 'manual', 'spec', 'test_report', 'reference', 'other']);
const normalizeCategory = (category) => validCategories.has(category) ? category : 'catalog';
const validBrands = new Set(['3m', 'bostik']);
const normalizeBrand = (brand) => validBrands.has(brand) ? brand : '3m';

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

const DOCUMENT_MAX_BYTES = 75 * 1024 * 1024;
const IMAGE_MAX_BYTES = 10 * 1024 * 1024;
const documentTypes = new Map([
  ['application/pdf', new Set(['.pdf'])],
  ['image/jpeg', new Set(['.jpg', '.jpeg'])],
  ['image/png', new Set(['.png'])]
]);
const imageTypes = new Map([
  ['image/jpeg', new Set(['.jpg', '.jpeg'])],
  ['image/png', new Set(['.png'])],
  ['image/webp', new Set(['.webp'])]
]);
const extensionByMime = new Map([
  ['application/pdf', '.pdf'],
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp']
]);

const decodeOriginalName = (filename) => {
  const decoded = Buffer.from(filename, 'latin1').toString('utf8');
  return decoded.includes('\uFFFD') ? filename : decoded;
};

const safeUploadName = (file) => {
  const originalName = path.basename(decodeOriginalName(file.originalname)).normalize('NFKC');
  const originalStem = path.basename(originalName, path.extname(originalName));
  const safeStem = [...originalStem]
    .filter(character => character.charCodeAt(0) >= 32)
    .join('')
    .replace(/[<>:"/\\|?*]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '')
    .slice(0, 120) || 'file';
  return `${Date.now()}-${safeStem}${extensionByMime.get(file.mimetype) || ''}`;
};

const createFileFilter = (allowedTypes) => (_req, file, callback) => {
  const extension = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = allowedTypes.get(file.mimetype);
  if (!allowedExtensions || !allowedExtensions.has(extension)) {
    return callback(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'file'));
  }
  callback(null, true);
};

const uploadLimits = (fileSize) => ({
  fileSize,
  files: 1,
  fields: 12,
  parts: 14,
  fieldNameSize: 100,
  fieldSize: 128 * 1024
});

const hasValidSignature = (file) => {
  const bytes = fs.readFileSync(file.path).subarray(0, 12);
  if (file.mimetype === 'application/pdf') return bytes.subarray(0, 5).toString() === '%PDF-';
  if (file.mimetype === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (file.mimetype === 'image/png') return bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (file.mimetype === 'image/webp') return bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WEBP';
  return false;
};

const validateUploadSignature = (req, res, next) => {
  if (!req.file || hasValidSignature(req.file)) return next();
  fs.rmSync(req.file.path, { force: true });
  return res.status(400).json({ error: 'File content does not match the allowed file type.' });
};

const uploadedFilesFromRequest = (req) => {
  if (req.file) return [req.file];
  if (Array.isArray(req.files)) return req.files;
  return Object.values(req.files || {}).flat();
};

const removeUploadedFiles = (files) => {
  for (const file of files) {
    try {
      fs.rmSync(file.path, { force: true });
    } catch (error) {
      console.error('Could not remove uploaded file:', error);
    }
  }
};

const validateUploadSignatures = (req, res, next) => {
  const files = uploadedFilesFromRequest(req);
  if (files.every(hasValidSignature)) return next();
  removeUploadedFiles(files);
  return res.status(400).json({ error: 'One or more files do not match the allowed image type.' });
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
    cb(null, safeUploadName(file));
  }
});
const upload = multer({
  storage,
  fileFilter: createFileFilter(documentTypes),
  limits: uploadLimits(DOCUMENT_MAX_BYTES)
});

server.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
server.use(cors({
  credentials: true,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    const normalizedOrigin = origin.replace(/\/$/, '');
    return callback(null, allowedOrigins.has(normalizedOrigin));
  }
}));
server.use(middlewares);

server.get('/auth/status', (req, res) => {
  res.json({ authenticated: hasAdminSession(req) });
});

server.post('/auth/login', (req, res) => {
  const clientKey = `admin:${req.ip || req.socket.remoteAddress || 'unknown'}`;
  const now = Date.now();
  const currentAttempt = loginAttempts.get(clientKey);
  const attempt = currentAttempt && currentAttempt.resetAt > now
    ? currentAttempt
    : { count: 0, resetAt: now + 15 * 60 * 1000 };

  if (attempt.count >= 5) {
    res.setHeader('Retry-After', Math.ceil((attempt.resetAt - now) / 1000));
    return res.status(429).json({ error: 'Too many login attempts. Please try again later.' });
  }

  if (!safeEqual(req.body?.password, adminPassword)) {
    attempt.count += 1;
    loginAttempts.set(clientKey, attempt);
    return res.status(401).json({ error: 'Invalid password.' });
  }

  loginAttempts.delete(clientKey);
  const expiresAt = now + sessionDurationMs;
  res.cookie(sessionCookieName, signSession(expiresAt, 'admin'), {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: '/',
    maxAge: sessionDurationMs
  });
  return res.json({ authenticated: true, expiresAt });
});

server.post('/auth/logout', (req, res) => {
  res.clearCookie(sessionCookieName, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: '/'
  });
  res.json({ authenticated: false });
});

server.post('/auth/download-access', (req, res) => {
  const clientKey = `download:${req.ip || req.socket.remoteAddress || 'unknown'}`;
  const now = Date.now();
  const currentAttempt = loginAttempts.get(clientKey);
  const attempt = currentAttempt && currentAttempt.resetAt > now
    ? currentAttempt
    : { count: 0, resetAt: now + 15 * 60 * 1000 };

  if (attempt.count >= 10) {
    res.setHeader('Retry-After', Math.ceil((attempt.resetAt - now) / 1000));
    return res.status(429).json({ error: 'Too many password attempts. Please try again later.' });
  }

  if (!safeEqual(req.body?.password, downloadPassword)) {
    attempt.count += 1;
    loginAttempts.set(clientKey, attempt);
    return res.status(401).json({ error: 'Invalid download password.' });
  }

  loginAttempts.delete(clientKey);
  const expiresAt = now + sessionDurationMs;
  res.cookie(downloadCookieName, signSession(expiresAt, 'download'), {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: '/download',
    maxAge: sessionDurationMs
  });
  return res.json({ authorized: true, expiresAt });
});

server.use('/download', requireDownloadAccess, express.static(path.join(publicDir, 'download'), {
  fallthrough: false,
  index: false
}));
server.use(express.static(publicDir, { index: false }));
server.use(express.static(path.join(__dirname, 'dist')));

server.use((req, res, next) => {
  const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
  const isDatabaseRoute = /^\/(banners|downloads|groups|series|models|portfolio|videos)(\/|$)/.test(req.path);
  const isProtectedUtility = /^\/(upload-|maintenance\/)/.test(req.path);
  if ((isMutation && isDatabaseRoute) || isProtectedUtility) {
    return requireAdmin(req, res, next);
  }
  next();
});

server.use(/^\/series(?:\/|$)/, sanitizeSeriesPayload);

server.use((req, res, next) => {
  const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
  const isDatabaseRoute = /^\/(banners|downloads|groups|series|models|portfolio|videos)(\/|$)/.test(req.path);
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

const safelyDeletedCollections = new Set(['banners', 'downloads', 'groups', 'series', 'models', 'portfolio', 'videos']);

server.delete('/:collection/:id', (req, res, next) => {
  const { collection, id } = req.params;
  if (!safelyDeletedCollections.has(collection)) return next();

  const records = router.db.get(collection).value() || [];
  const matchIndex = records.findIndex(item => String(item?.id) === String(id));
  if (matchIndex < 0) return res.status(404).json({ error: 'Record not found.' });

  const updatedRecords = records.filter((_, index) => index !== matchIndex);
  router.db.set(collection, updatedRecords).write();
  return res.json({});
});

// Custom upload endpoint
server.post('/upload-download', upload.single('file'), validateUploadSignature, (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  const category = normalizeCategory(req.body.category);
  const folderName = getDirByCategory(category);
  const fileUrl = `/download/${folderName}/${req.file.filename}`;
  res.json({ url: fileUrl });
});

server.post('/upload-download-and-register', upload.single('file'), validateUploadSignature, (req, res) => {
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
    brand: normalizeBrand(req.body.brand),
    ext,
    info: `${ext}  ${(req.file.size / (1024 * 1024)).toFixed(1)} MB`,
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
    const sampleSlot = /^image([1-4])$/.exec(file.fieldname)?.[1];
    const sampleId = String(req.body?.id || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80);
    const suffix = sampleSlot
      ? `sample-${sampleSlot}-${sampleId || Math.round(Math.random() * 1E9)}`
      : String(Math.round(Math.random() * 1E9));
    const safeName = Date.now() + '-' + suffix + (extensionByMime.get(file.mimetype) || '.jpg');
    cb(null, safeName);
  }
});

const samplesDir = path.join(publicDir, 'samples');
if (!fs.existsSync(samplesDir)) {
  fs.mkdirSync(samplesDir, { recursive: true });
}

const samplesStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, samplesDir);
  },
  filename: function (req, file, cb) {
    const sampleSlot = /^image([1-4])$/.exec(file.fieldname)?.[1];
    const sampleId = String(req.body?.id || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80);
    const suffix = sampleSlot
      ? `sample-${sampleSlot}-${sampleId || Math.round(Math.random() * 1E9)}`
      : String(Math.round(Math.random() * 1E9));
    const safeName = Date.now() + '-' + suffix + (extensionByMime.get(file.mimetype) || '.jpg');
    cb(null, safeName);
  }
});

const uploadPortfolio = multer({
  storage: portfolioStorage,
  fileFilter: createFileFilter(imageTypes),
  limits: uploadLimits(IMAGE_MAX_BYTES)
});
const uploadSample = multer({
  storage: samplesStorage,
  fileFilter: createFileFilter(imageTypes),
  limits: {
    ...uploadLimits(IMAGE_MAX_BYTES),
    files: 4,
    fields: 20,
    parts: 24
  }
});

const sampleImageFields = ['image1', 'image2', 'image3', 'image4'];

const normalizeStoredFileUrl = (fileUrl) => String(fileUrl || '').replace(/\\/g, '/').toLowerCase();

const fileUrlToPath = (fileUrl, prefix, dir) => {
  const normalizedUrl = String(fileUrl || '').replace(/\\/g, '/');
  if (!normalizedUrl.startsWith(prefix)) return null;
  const filePath = path.resolve(dir, path.basename(normalizedUrl));
  const root = path.resolve(dir);
  if (!filePath.startsWith(`${root}${path.sep}`)) return null;
  return filePath;
};

const portfolioUrlToPath = (fileUrl) => fileUrlToPath(fileUrl, '/portfolio/', portfolioDir);
const sampleUrlToPath = (fileUrl) => fileUrlToPath(fileUrl, '/samples/', samplesDir);

const removeReplacedSampleImages = (previousRecord, nextRecord) => {
  if (!previousRecord) return;

  const nextImages = new Set(sampleImageFields
    .map(field => normalizeStoredFileUrl(nextRecord[field]))
    .filter(Boolean));
  const referencedByOtherSamples = new Set((router.db.get('portfolio').value() || [])
    .filter(item => item.type === 'sample' && String(item.id) !== String(nextRecord.id))
    .flatMap(item => sampleImageFields.map(field => normalizeStoredFileUrl(item[field])))
    .filter(Boolean));

  for (const field of sampleImageFields) {
    const previousUrl = previousRecord[field];
    const normalizedPreviousUrl = normalizeStoredFileUrl(previousUrl);
    if (!normalizedPreviousUrl || nextImages.has(normalizedPreviousUrl) || referencedByOtherSamples.has(normalizedPreviousUrl)) continue;

    let filePath = sampleUrlToPath(previousUrl);
    if (!filePath) filePath = portfolioUrlToPath(previousUrl);
    if (!filePath || !fs.existsSync(filePath)) continue;
    try {
      fs.rmSync(filePath, { force: true });
    } catch (error) {
      console.error('Could not remove replaced sample image:', error);
    }
  }
};

const getOrphanSampleImages = () => {
  const referenced = new Set((router.db.get('portfolio').value() || [])
    .filter(item => item.type === 'sample')
    .flatMap(item => sampleImageFields.map(field => normalizeStoredFileUrl(item[field])))
    .filter(Boolean));
  const folders = [
    { directory: portfolioDir, urlPrefix: '/portfolio' },
    { directory: samplesDir, urlPrefix: '/samples' },
    { directory: path.join(publicDir, 'download', 'e-catalog'), urlPrefix: '/download/e-catalog' }
  ];

  return folders.flatMap(({ directory, urlPrefix }) => {
    if (!fs.existsSync(directory)) return [];
    return fs.readdirSync(directory, { withFileTypes: true })
      .filter(entry => entry.isFile() && /sample-[1-4]/i.test(entry.name) && /\.(png|jpe?g|webp)$/i.test(entry.name))
      .map(entry => {
        const filePath = path.join(directory, entry.name);
        const fileUrl = `${urlPrefix}/${entry.name}`;
        const stat = fs.statSync(filePath);
        return {
          filename: entry.name,
          size: stat.size,
          modifiedAt: stat.mtime.toISOString(),
          isOrphan: !referenced.has(fileUrl.toLowerCase())
        };
      })
      .filter(item => item.isOrphan);
  });
};

server.get('/maintenance/orphan-samples', (_req, res) => {
  const files = getOrphanSampleImages();
  res.json({ count: files.length, files });
});

server.post(
  '/upload-sample-and-register',
  uploadSample.fields(sampleImageFields.map(name => ({ name, maxCount: 1 }))),
  validateUploadSignatures,
  (req, res) => {
    const uploadedFiles = uploadedFilesFromRequest(req);
    try {
      const id = String(req.body.id || Date.now());
      const portfolio = router.db.get('portfolio');
      const existingRecord = portfolio.find({ id }).value();
      const previousRecord = existingRecord ? { ...existingRecord } : null;
      const imageValues = Object.fromEntries(sampleImageFields.map(field => {
        const uploaded = req.files?.[field]?.[0];
        return [field, uploaded ? `/samples/${uploaded.filename}` : String(req.body[`existing${field.charAt(0).toUpperCase()}${field.slice(1)}`] || '')];
      }));

      if (!imageValues.image1) {
        removeUploadedFiles(uploadedFiles);
        return res.status(400).json({ error: 'The first sample image is required.' });
      }

      const record = {
        id,
        type: 'sample',
        seriesId: String(req.body.seriesId || ''),
        modelId: String(req.body.modelId || ''),
        title: String(req.body.title || ''),
        label1: String(req.body.label1 || ''),
        label2: String(req.body.label2 || ''),
        label3: String(req.body.label3 || ''),
        label4: String(req.body.label4 || ''),
        ...imageValues
      };

      createDatabaseBackup(existingRecord ? 'put-sample' : 'post-sample');
      if (existingRecord) {
        portfolio.find({ id }).assign(record).write();
      } else {
        portfolio.push(record).write();
      }
      removeReplacedSampleImages(previousRecord, record);
      return res.status(existingRecord ? 200 : 201).json({ record });
    } catch (error) {
      removeUploadedFiles(uploadedFiles);
      console.error('Sample registration failed:', error);
      return res.status(500).json({ error: 'The sample images could not be registered.' });
    }
  }
);

server.post('/upload-portfolio', uploadPortfolio.single('file'), validateUploadSignature, (req, res) => {
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
    const safeName = Date.now() + '-' + Math.round(Math.random() * 1E9) + (extensionByMime.get(file.mimetype) || '.jpg');
    cb(null, safeName);
  }
});
const uploadBanner = multer({
  storage: bannerStorage,
  fileFilter: createFileFilter(imageTypes),
  limits: uploadLimits(IMAGE_MAX_BYTES)
});

server.post('/upload-banner', uploadBanner.single('file'), validateUploadSignature, (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  const fileUrl = `/banners/${req.file.filename}`;
  res.json({ url: fileUrl });
});

server.use((error, _req, res, next) => {
  if (!(error instanceof multer.MulterError)) return next(error);
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File is larger than the allowed upload limit.' });
  }
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ error: 'File type is not allowed or too many files were supplied.' });
  }
  return res.status(400).json({ error: 'Invalid upload request.' });
});

server.use((req, res, next) => {
  if (/^\/(banners|downloads|groups|series|models|portfolio|videos)(\/|$)/.test(req.path)) {
    return router(req, res, next);
  }
  next();
});

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
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(404).json({ error: 'Route not found.' });
  }
  res.type('html').send(fs.readFileSync(appIndexPath, 'utf8'));
});

server.use((error, _req, res, _next) => {
  void _next;
  const status = Number(error.status || error.statusCode || 500);
  if (status >= 500) console.error('Unhandled server error:', error);
  res.status(status).json({
    error: status >= 500 ? 'Internal server error.' : 'Request could not be completed.',
    ...(isProduction ? {} : { detail: error.message })
  });
});

const port = Number(process.env.PORT || 3001);
const httpServer = server.listen(port, () => {
  console.log(`JSON Server with Multer is running on http://localhost:${port}`);
});

