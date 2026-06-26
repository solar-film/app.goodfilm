import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const projectRoot = path.resolve(import.meta.dirname, '..');
const sourcePath = path.resolve(process.argv[2] || '');
const intentionallyDeletedId = String(process.argv[3] || '');

if (!sourcePath || !fs.existsSync(sourcePath)) {
  throw new Error('A valid pre-delete backup path is required.');
}
if (!intentionallyDeletedId) {
  throw new Error('The intentionally deleted record ID is required.');
}

const dataPath = path.join(projectRoot, 'data', 'database.json');
const rootDbPath = path.join(projectRoot, 'db.json');
const backupDir = path.join(projectRoot, 'backups');
const collections = ['banners', 'downloads', 'groups', 'series', 'models', 'portfolio'];
const beforeDelete = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const current = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const restored = {};
for (const collection of collections) {
  const merged = new Map((beforeDelete[collection] || []).map(item => [String(item.id), item]));
  for (const item of current[collection] || []) merged.set(String(item.id), item);
  restored[collection] = [...merged.values()];
}
restored.portfolio = restored.portfolio.filter(item => String(item.id) !== intentionallyDeletedId);

const samples = restored.portfolio.filter(item => item.type === 'sample');
const pendingSamples = samples.filter(item => !item.seriesId);
if (restored.downloads.length !== 68 || samples.length !== 39 || pendingSamples.length !== 35) {
  throw new Error(`Unexpected restore result: downloads=${restored.downloads.length}, samples=${samples.length}, pending=${pendingSamples.length}`);
}

fs.mkdirSync(backupDir, { recursive: true });
const timestamp = Date.now();
fs.copyFileSync(dataPath, path.join(backupDir, `database-${timestamp}-before-cascade-restore.json`));

const serialized = `${JSON.stringify(restored, null, 2)}\n`;
for (const target of [dataPath, rootDbPath]) {
  const temporary = `${target}.${timestamp}.tmp`;
  fs.writeFileSync(temporary, serialized, 'utf8');
  fs.renameSync(temporary, target);
}

console.log(JSON.stringify({
  restored: true,
  portfolio: restored.portfolio.length,
  samples: samples.length,
  pendingSamples: pendingSamples.length,
  downloads: restored.downloads.length,
  intentionallyDeletedId
}, null, 2));
