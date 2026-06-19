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
const router = jsonServer.router('db.json');
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

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const category = req.body.category || 'catalog';
    const folderName = getDirByCategory(category);
    const destDir = path.join(__dirname, 'public', 'download', folderName);
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
server.use(express.static(path.join(__dirname, 'public')));
server.use(express.static(path.join(__dirname, 'dist')));

// Custom upload endpoint
server.post('/upload-download', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  const category = req.body.category || 'catalog';
  const folderName = getDirByCategory(category);
  const fileUrl = `/download/${folderName}/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// Portfolio storage
const portfolioDir = path.join(__dirname, 'public', 'portfolio');
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
const bannerDir = path.join(__dirname, 'public', 'banners');
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

// Catch-all route to serve the React application
server.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

server.listen(3001, () => {
  console.log('JSON Server with Multer is running on http://localhost:3001');
});
