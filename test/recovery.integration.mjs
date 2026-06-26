import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'goodfilm-recovery-'));
const dataDir = path.join(tempRoot, 'data');
const publicDir = path.join(tempRoot, 'public');
const reportDir = path.join(publicDir, 'download', 'test_report');
const backupDir = path.join(tempRoot, 'backups');
let child;

const getFreePort = () => new Promise((resolve, reject) => {
  const probe = net.createServer();
  probe.once('error', reject);
  probe.listen(0, '127.0.0.1', () => {
    const address = probe.address();
    probe.close(() => resolve(address.port));
  });
});

const waitForServer = (processHandle) => new Promise((resolve, reject) => {
  let output = '';
  const timer = setTimeout(() => reject(new Error(`Server startup timed out.\n${output}`)), 10000);
  processHandle.stdout.on('data', chunk => {
    output += chunk.toString();
    if (output.includes('JSON Server with Multer is running')) {
      clearTimeout(timer);
      resolve();
    }
  });
  processHandle.stderr.on('data', chunk => {
    output += chunk.toString();
  });
  processHandle.once('exit', code => {
    clearTimeout(timer);
    reject(new Error(`Server exited early with code ${code}.\n${output}`));
  });
});

try {
  fs.mkdirSync(reportDir, { recursive: true });
  fs.mkdirSync(dataDir, { recursive: true });
  fs.mkdirSync(backupDir, { recursive: true });
  fs.writeFileSync(path.join(dataDir, 'database.json'), JSON.stringify({
    banners: [],
    downloads: [],
    groups: [{ id: 'g1', title: 'Fixture group' }],
    series: [{ id: 'pr', groupId: 'g1', title: 'Fixture series' }],
    models: [],
    portfolio: []
  }, null, 2));
  fs.writeFileSync(path.join(reportDir, '1780000000000-original-test-report.pdf'), `%PDF-1.4\n${'recovery fixture '.repeat(100)}`);
  fs.writeFileSync(path.join(reportDir, '1780000000000-invalid-test.pdf'), 'not a real pdf');

  const port = await getFreePort();
  child = spawn(process.execPath, ['server.js'], {
    cwd: projectDir,
    env: {
      ...process.env,
      PORT: String(port),
      GOODFILM_DATA_DIR: dataDir,
      GOODFILM_PUBLIC_DIR: publicDir,
      GOODFILM_BACKUP_DIR: backupDir,
      ADMIN_PASSWORD: 'integration-admin-password',
      DOWNLOAD_PASSWORD: 'integration-download-password',
      ADMIN_SESSION_SECRET: 'integration-session-secret-at-least-32-characters'
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  await waitForServer(child);

  const baseUrl = `http://127.0.0.1:${port}`;
  const loginResponse = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'integration-admin-password' })
  });
  assert.equal(loginResponse.status, 200, 'admin login should succeed');
  const adminCookie = loginResponse.headers.get('set-cookie').split(';')[0];

  let downloads = await fetch(`${baseUrl}/downloads`).then(response => response.json());
  let testReports = downloads.filter(item => item.category === 'test_report');
  assert.equal(testReports.length, 1, 'startup recovery should register the orphan Test Report');
  assert.equal(testReports[0].file, '/download/test_report/1780000000000-original-test-report.pdf');

  let preview = await fetch(`${baseUrl}/maintenance/orphan-downloads?category=test_report`, { headers: { Cookie: adminCookie } }).then(response => response.json());
  assert.equal(preview.count, 0, 'a recovered file must not remain orphaned');

  fs.writeFileSync(path.join(reportDir, '1780000000001-second-report.pdf'), `%PDF-1.4\n${'manual recovery fixture '.repeat(100)}`);
  preview = await fetch(`${baseUrl}/maintenance/orphan-downloads?category=test_report`, { headers: { Cookie: adminCookie } }).then(response => response.json());
  assert.equal(preview.count, 1, 'manual preview should find a new orphan file');

  const recovery = await fetch(`${baseUrl}/maintenance/recover-downloads?category=test_report`, {
    method: 'POST',
    headers: { Cookie: adminCookie }
  })
    .then(response => response.json());
  assert.equal(recovery.count, 1, 'manual recovery should register the new orphan');

  const form = new FormData();
  form.append('brand', 'bostik');
  form.append('category', 'test_report');
  form.append('title', 'Uploaded Test Report');
  form.append('seriesId', 'pr');
  form.append('file', new Blob([`%PDF-1.4\n${'transaction fixture '.repeat(100)}`], { type: 'application/pdf' }), 'uploaded-report.pdf');
  const uploadResponse = await fetch(`${baseUrl}/upload-download-and-register`, {
    method: 'POST',
    headers: { Cookie: adminCookie },
    body: form
  });
  assert.equal(uploadResponse.status, 201, 'transactional upload should create the file and metadata together');
  const uploaded = await uploadResponse.json();
  assert.equal(uploaded.record.brand, 'bostik', 'transactional upload should preserve the product brand');

  const sampleForm = new FormData();
  sampleForm.append('id', 'transactional-sample');
  sampleForm.append('seriesId', 'pr');
  sampleForm.append('modelId', '');
  sampleForm.append('title', 'Transactional sample');
  sampleForm.append('label1', 'Outside');
  sampleForm.append('label2', 'Inside');
  sampleForm.append('image1', new Blob([Buffer.from([0xff, 0xd8, 0xff, 0xdb, ...Buffer.alloc(2048)])], { type: 'image/jpeg' }), 'outside.jpg');
  sampleForm.append('image2', new Blob([Buffer.from([0xff, 0xd8, 0xff, 0xdb, ...Buffer.alloc(2048)])], { type: 'image/jpeg' }), 'inside.jpg');
  const sampleResponse = await fetch(`${baseUrl}/upload-sample-and-register`, {
    method: 'POST',
    headers: { Cookie: adminCookie },
    body: sampleForm
  });
  assert.equal(sampleResponse.status, 201, await sampleResponse.text());
  const savedSamples = await fetch(`${baseUrl}/portfolio`).then(response => response.json());
  const savedSample = savedSamples.find(item => item.id === 'transactional-sample');
  assert.ok(savedSample?.image1 && savedSample?.image2, 'sample images and metadata should be registered together');

  const editSampleResponse = await fetch(`${baseUrl}/upload-sample-and-register`, {
    method: 'POST',
    headers: {
      Cookie: adminCookie,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: savedSample.id,
      seriesId: 'pr',
      modelId: 'pr-20',
      title: 'Edited without replacing images',
      label1: 'Outside edited',
      label2: 'Inside edited',
      existingImage1: savedSample.image1,
      existingImage2: savedSample.image2,
      existingImage3: '',
      existingImage4: ''
    })
  });
  assert.equal(editSampleResponse.status, 200, await editSampleResponse.text());
  const editedSamples = await fetch(`${baseUrl}/portfolio`).then(response => response.json());
  const editedSample = editedSamples.find(item => item.id === savedSample.id);
  assert.equal(editedSample.modelId, 'pr-20');
  assert.equal(editedSample.image1, savedSample.image1);

  const previousSampleImagePath = path.join(publicDir, editedSample.image1.replace(/^\//, ''));
  assert.equal(fs.existsSync(previousSampleImagePath), true, 'the original sample image should exist before replacement');
  const replacementSampleForm = new FormData();
  replacementSampleForm.append('id', editedSample.id);
  replacementSampleForm.append('seriesId', editedSample.seriesId);
  replacementSampleForm.append('modelId', editedSample.modelId);
  replacementSampleForm.append('title', editedSample.title);
  replacementSampleForm.append('label1', editedSample.label1);
  replacementSampleForm.append('label2', editedSample.label2);
  replacementSampleForm.append('existingImage2', editedSample.image2);
  replacementSampleForm.append('existingImage3', '');
  replacementSampleForm.append('existingImage4', '');
  replacementSampleForm.append('image1', new Blob([Buffer.from([0xff, 0xd8, 0xff, 0xdb, ...Buffer.alloc(2048)])], { type: 'image/jpeg' }), 'outside-replacement.jpg');
  const replacementSampleResponse = await fetch(`${baseUrl}/upload-sample-and-register`, {
    method: 'POST',
    headers: { Cookie: adminCookie },
    body: replacementSampleForm
  });
  assert.equal(replacementSampleResponse.status, 200, await replacementSampleResponse.text());
  const replacedSamples = await fetch(`${baseUrl}/portfolio`).then(response => response.json());
  const replacedSample = replacedSamples.find(item => item.id === savedSample.id);
  assert.notEqual(replacedSample.image1, editedSample.image1, 'replacing image1 should register the new file');
  assert.equal(replacedSample.image2, editedSample.image2, 'unchanged sample images should be preserved');
  assert.equal(fs.existsSync(previousSampleImagePath), false, 'replacing a sample image should remove the unreferenced previous file');
  assert.equal(editedSample.image2, savedSample.image2);
  assert.ok(fs.existsSync(path.join(publicDir, replacedSample.image1.replace(/^\//, ''))));
  assert.ok(fs.existsSync(path.join(publicDir, replacedSample.image2.replace(/^\//, ''))));

  for (const id of ['pending-sample-a', 'pending-sample-b']) {
    const createPendingResponse = await fetch(`${baseUrl}/portfolio`, {
      method: 'POST',
      headers: { Cookie: adminCookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, type: 'sample', seriesId: '', modelId: '', title: id, image1: `/portfolio/${id}.jpg` })
    });
    assert.equal(createPendingResponse.status, 201);
  }
  const createUnassignedDownload = await fetch(`${baseUrl}/downloads`, {
    method: 'POST',
    headers: { Cookie: adminCookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: 'unassigned-download', title: 'Unassigned', seriesId: '', category: 'other', file: '/download/other/unassigned.pdf' })
  });
  assert.equal(createUnassignedDownload.status, 201);

  const safeDeleteResponse = await fetch(`${baseUrl}/portfolio/pending-sample-a`, {
    method: 'DELETE',
    headers: { Cookie: adminCookie }
  });
  assert.equal(safeDeleteResponse.status, 200);
  const portfolioAfterSafeDelete = await fetch(`${baseUrl}/portfolio`).then(response => response.json());
  assert.equal(portfolioAfterSafeDelete.some(item => item.id === 'pending-sample-a'), false);
  assert.equal(portfolioAfterSafeDelete.some(item => item.id === 'pending-sample-b'), true, 'deleting one pending sample must not cascade to another');
  const downloadsAfterSafeDelete = await fetch(`${baseUrl}/downloads`).then(response => response.json());
  assert.equal(downloadsAfterSafeDelete.some(item => item.id === 'unassigned-download'), true, 'deleting a sample must not remove unassigned downloads');

  downloads = await fetch(`${baseUrl}/downloads`).then(response => response.json());
  testReports = downloads.filter(item => item.category === 'test_report');
  assert.equal(testReports.length, 3, 'all recovered and uploaded Test Reports should be listed');

  const protectedDownload = await fetch(`${baseUrl}${uploaded.url}`);
  assert.equal(protectedDownload.status, 401, 'direct download should require the download password');
  const downloadLogin = await fetch(`${baseUrl}/auth/download-access`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'integration-download-password' })
  });
  assert.equal(downloadLogin.status, 200, 'download password should grant access');
  const downloadCookie = downloadLogin.headers.get('set-cookie').split(';')[0];
  const authorizedDownload = await fetch(`${baseUrl}${uploaded.url}`, { headers: { Cookie: downloadCookie } });
  assert.equal(authorizedDownload.status, 200, 'authorized download should return the file');
  assert.ok(fs.existsSync(path.join(backupDir, 'test-report-recovery-v1.json')), 'automatic recovery marker should exist');
  assert.ok(fs.readdirSync(backupDir).some(name => name.startsWith('database-')), 'database backups should be created');

  console.log('Recovery integration test passed.');
} finally {
  if (child && !child.killed) child.kill();
  const resolvedTemp = path.resolve(tempRoot);
  const resolvedOsTemp = path.resolve(os.tmpdir());
  if (!resolvedTemp.startsWith(`${resolvedOsTemp}${path.sep}`)) {
    throw new Error(`Refusing to clean unexpected test directory: ${resolvedTemp}`);
  }
  fs.rmSync(resolvedTemp, { recursive: true, force: true });
}
