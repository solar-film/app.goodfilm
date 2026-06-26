const fs = require('fs');
const path = require('path');
const envPath = path.join(process.cwd(), '.env');
let env = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const sep = trimmed.indexOf('=');
    if (sep < 1) return;
    const key = trimmed.slice(0, sep).trim();
    const rawValue = trimmed.slice(sep + 1).trim();
    const value = rawValue.replace(/^(['"])(.*)\1$/, '$2');
    env[key] = value;
  });
}
console.log('Parsed ADMIN_PASSWORD:', env.ADMIN_PASSWORD);
console.log('Is it exactly "oil1234"?', env.ADMIN_PASSWORD === 'oil1234');
