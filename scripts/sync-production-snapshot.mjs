import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const sourceUrl = String(process.env.GOODFILM_SYNC_SOURCE || 'https://nas.goodfilmshop.com').replace(/\/$/, '');
const collections = ['banners', 'downloads', 'groups', 'series', 'models', 'portfolio'];
const args = process.argv.slice(2);
const shouldApply = args.includes('--apply');
const shouldSyncAssets = args.includes('--assets');
const extraTarget = args.find(argument => argument.startsWith('--extra-target='))?.slice('--extra-target='.length);

const fetchJson = async (collection) => {
  const response = await fetch(`${sourceUrl}/${collection}`, {
    headers: { Accept: 'application/json' }
  });
  if (!response.ok) throw new Error(`${collection}: HTTP ${response.status}`);
  const value = await response.json();
  if (!Array.isArray(value)) throw new Error(`${collection}: expected an array`);
  return value;
};

const snapshot = Object.fromEntries(
  await Promise.all(collections.map(async collection => [collection, await fetchJson(collection)]))
);

const uniqueIds = (items, collection) => {
  const ids = new Set();
  for (const item of items) {
    const id = String(item?.id || '').trim();
    if (!id) throw new Error(`${collection}: record without id`);
    if (ids.has(id)) throw new Error(`${collection}: duplicate id ${id}`);
    ids.add(id);
  }
  return ids;
};

const groupIds = uniqueIds(snapshot.groups, 'groups');
const seriesIds = uniqueIds(snapshot.series, 'series');
const modelIds = uniqueIds(snapshot.models, 'models');
uniqueIds(snapshot.banners, 'banners');
uniqueIds(snapshot.downloads, 'downloads');
uniqueIds(snapshot.portfolio, 'portfolio');

for (const series of snapshot.series) {
  if (!groupIds.has(String(series.groupId))) {
    throw new Error(`series ${series.id}: missing group ${series.groupId}`);
  }
}
for (const model of snapshot.models) {
  if (!seriesIds.has(String(model.seriesId))) {
    throw new Error(`model ${model.id}: missing series ${model.seriesId}`);
  }
}
for (const item of [...snapshot.downloads, ...snapshot.portfolio]) {
  if (item.seriesId && !seriesIds.has(String(item.seriesId))) {
    throw new Error(`record ${item.id}: missing series ${item.seriesId}`);
  }
  if (item.modelId && !modelIds.has(String(item.modelId))) {
    throw new Error(`record ${item.id}: missing model ${item.modelId}`);
  }
}

console.table(Object.fromEntries(collections.map(collection => [collection, snapshot[collection].length])));

if (!shouldApply) {
  console.log('Validation passed. Run with --apply to update local snapshot files.');
  process.exit(0);
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const targets = [
  path.join(projectRoot, 'db.json'),
  path.join(projectRoot, 'data', 'database.json')
];
if (extraTarget) targets.push(path.resolve(extraTarget));

const serialized = `${JSON.stringify(snapshot, null, 2)}\n`;
for (const target of targets) {
  await fs.mkdir(path.dirname(target), { recursive: true });
  try {
    const current = await fs.readFile(target);
    const backupDirectory = target.startsWith(projectRoot)
      ? path.join(projectRoot, 'backups', 'production-sync')
      : path.join(path.dirname(target), 'production-sync-backups');
    await fs.mkdir(backupDirectory, { recursive: true });
    const backupName = `${path.basename(path.dirname(target))}-${path.basename(target)}-${timestamp}.bak`;
    await fs.writeFile(path.join(backupDirectory, backupName), current);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  await fs.writeFile(target, serialized, 'utf8');
  console.log(`Updated ${target}`);
}

if (!shouldSyncAssets) process.exit(0);

const assetPaths = new Set();
for (const banner of snapshot.banners) {
  if (banner.imageUrl) assetPaths.add(banner.imageUrl);
}
for (const item of snapshot.portfolio) {
  for (const key of ['beforeImage', 'afterImage', 'image1', 'image2', 'image3', 'image4']) {
    if (item[key]) assetPaths.add(item[key]);
  }
}
for (const item of snapshot.downloads) {
  if (item.file) assetPaths.add(item.file);
}
for (const item of snapshot.series) {
  if (item.referenceFile) assetPaths.add(item.referenceFile);
}

const pendingAssets = [...assetPaths].filter(assetPath => {
  const normalized = String(assetPath).replace(/\\/g, '/');
  return /^\/(banners|portfolio|download)\//.test(normalized) && !normalized.split('/').includes('..');
});

let downloaded = 0;
let skipped = 0;
const syncAsset = async (assetPath) => {
  const normalized = assetPath.replace(/^\/+/, '');
  const destination = path.join(projectRoot, 'public', ...normalized.split('/'));
  try {
    const stat = await fs.stat(destination);
    if (stat.isFile() && stat.size > 0) {
      skipped += 1;
      return;
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  const response = await fetch(new URL(assetPath, `${sourceUrl}/`));
  if (!response.ok) throw new Error(`${assetPath}: HTTP ${response.status}`);
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('text/html')) throw new Error(`${assetPath}: received HTML instead of an asset`);
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, Buffer.from(await response.arrayBuffer()));
  downloaded += 1;
  console.log(`Downloaded ${assetPath}`);
};

const concurrency = 6;
for (let index = 0; index < pendingAssets.length; index += concurrency) {
  await Promise.all(pendingAssets.slice(index, index + concurrency).map(syncAsset));
}

console.log(`Asset sync complete: ${downloaded} downloaded, ${skipped} already present.`);
