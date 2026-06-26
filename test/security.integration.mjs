import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'goodfilm-security-'));
const dataDir = path.join(tempRoot, 'data');
const publicDir = path.join(tempRoot, 'public');
const backupDir = path.join(tempRoot, 'backups');
const fixtureDir = path.join(publicDir, 'download', 'e-catalog');
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
  fs.mkdirSync(dataDir, { recursive: true });
  fs.mkdirSync(fixtureDir, { recursive: true });
  fs.mkdirSync(backupDir, { recursive: true });
  fs.copyFileSync(path.join(projectDir, 'db.json'), path.join(dataDir, 'database.json'));
  fs.writeFileSync(path.join(fixtureDir, 'protected.pdf'), `%PDF-1.4\n${'fixture '.repeat(200)}`);

  const port = await getFreePort();
  child = spawn(process.execPath, ['server.js'], {
    cwd: projectDir,
    env: {
      ...process.env,
      PORT: String(port),
      GOODFILM_DATA_DIR: dataDir,
      GOODFILM_PUBLIC_DIR: publicDir,
      GOODFILM_BACKUP_DIR: backupDir,
      ADMIN_PASSWORD: 'security-admin-password',
      DOWNLOAD_PASSWORD: 'security-download-password',
      ADMIN_SESSION_SECRET: 'security-session-secret-at-least-32-characters',
      CORS_ALLOWED_ORIGINS: 'https://allowed.example'
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  await waitForServer(child);

  const baseUrl = `http://127.0.0.1:${port}`;
  const allowedCors = await fetch(`${baseUrl}/groups`, { headers: { Origin: 'https://allowed.example' } });
  assert.equal(allowedCors.headers.get('access-control-allow-origin'), 'https://allowed.example');
  const deniedCors = await fetch(`${baseUrl}/groups`, { headers: { Origin: 'https://blocked.example' } });
  assert.equal(deniedCors.headers.get('access-control-allow-origin'), null);

  const unauthenticatedWrite = await fetch(`${baseUrl}/groups`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: 'blocked-write', title: 'blocked' })
  });
  assert.equal(unauthenticatedWrite.status, 401);

  const login = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'security-admin-password' })
  });
  assert.equal(login.status, 200);
  const adminCookie = login.headers.get('set-cookie').split(';')[0];

  const maliciousSeries = await fetch(`${baseUrl}/series`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({
      id: 'security-xss-test',
      groupId: 'g1',
      title: 'Security test',
      desc: 'Security test',
      longDesc: '<p>safe</p><img src="x" onerror="alert(1)"><script>alert(2)</script>'
    })
  });
  const maliciousBody = await maliciousSeries.text();
  assert.equal(maliciousSeries.status, 201, maliciousBody);
  const sanitized = JSON.parse(maliciousBody);
  assert.equal(sanitized.longDesc.includes('onerror'), false);
  assert.equal(sanitized.longDesc.includes('<script'), false);

  const invalidForm = new FormData();
  invalidForm.append('category', 'catalog');
  invalidForm.append('file', new Blob(['<html>not a pdf</html>'], { type: 'application/pdf' }), 'fake.pdf');
  const invalidUpload = await fetch(`${baseUrl}/upload-download`, {
    method: 'POST',
    headers: { Cookie: adminCookie },
    body: invalidForm
  });
  assert.equal(invalidUpload.status, 400);

  const directDownload = await fetch(`${baseUrl}/download/e-catalog/protected.pdf`);
  assert.equal(directDownload.status, 401);
  const downloadLogin = await fetch(`${baseUrl}/auth/download-access`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'security-download-password' })
  });
  assert.equal(downloadLogin.status, 200);
  const downloadCookie = downloadLogin.headers.get('set-cookie').split(';')[0];
  const unlockedDownload = await fetch(`${baseUrl}/download/e-catalog/protected.pdf`, { headers: { Cookie: downloadCookie } });
  assert.equal(unlockedDownload.status, 200);

  const adminDeepLink = await fetch(`${baseUrl}/admin`);
  const adminDeepLinkBody = await adminDeepLink.text();
  assert.equal(adminDeepLink.status, 200, adminDeepLinkBody);
  assert.match(adminDeepLink.headers.get('content-type'), /text\/html/);
  const bostikDeepLink = await fetch(`${baseUrl}/bostik-presentation`);
  assert.equal(bostikDeepLink.status, 200);

  console.log('Security integration test passed.');
} finally {
  if (child && !child.killed) child.kill();
  const resolvedTemp = path.resolve(tempRoot);
  const resolvedOsTemp = path.resolve(os.tmpdir());
  if (!resolvedTemp.startsWith(`${resolvedOsTemp}${path.sep}`)) {
    throw new Error(`Refusing to clean unexpected test directory: ${resolvedTemp}`);
  }
  fs.rmSync(resolvedTemp, { recursive: true, force: true });
}
