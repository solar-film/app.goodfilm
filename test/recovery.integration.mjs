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
  fs.copyFileSync(path.join(projectDir, 'db.json'), path.join(dataDir, 'database.json'));
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
      GOODFILM_BACKUP_DIR: backupDir
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  await waitForServer(child);

  const baseUrl = `http://127.0.0.1:${port}`;
  let downloads = await fetch(`${baseUrl}/downloads`).then(response => response.json());
  let testReports = downloads.filter(item => item.category === 'test_report');
  assert.equal(testReports.length, 1, 'startup recovery should register the orphan Test Report');
  assert.equal(testReports[0].file, '/download/test_report/1780000000000-original-test-report.pdf');

  let preview = await fetch(`${baseUrl}/maintenance/orphan-downloads?category=test_report`).then(response => response.json());
  assert.equal(preview.count, 0, 'a recovered file must not remain orphaned');

  fs.writeFileSync(path.join(reportDir, '1780000000001-second-report.pdf'), `%PDF-1.4\n${'manual recovery fixture '.repeat(100)}`);
  preview = await fetch(`${baseUrl}/maintenance/orphan-downloads?category=test_report`).then(response => response.json());
  assert.equal(preview.count, 1, 'manual preview should find a new orphan file');

  const recovery = await fetch(`${baseUrl}/maintenance/recover-downloads?category=test_report`, { method: 'POST' })
    .then(response => response.json());
  assert.equal(recovery.count, 1, 'manual recovery should register the new orphan');

  const form = new FormData();
  form.append('category', 'test_report');
  form.append('title', 'Uploaded Test Report');
  form.append('seriesId', 'pr');
  form.append('file', new Blob([`%PDF-1.4\n${'transaction fixture '.repeat(100)}`], { type: 'application/pdf' }), 'uploaded-report.pdf');
  const uploadResponse = await fetch(`${baseUrl}/upload-download-and-register`, { method: 'POST', body: form });
  assert.equal(uploadResponse.status, 201, 'transactional upload should create the file and metadata together');

  downloads = await fetch(`${baseUrl}/downloads`).then(response => response.json());
  testReports = downloads.filter(item => item.category === 'test_report');
  assert.equal(testReports.length, 3, 'all recovered and uploaded Test Reports should be listed');
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
