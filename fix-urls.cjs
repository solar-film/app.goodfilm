const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src', 'AdminPanel.jsx');
let content = fs.readFileSync(targetFile, 'utf8');

// Replace all occurrences of 'http://localhost:3001
content = content.replace(/'http:\/\/localhost:3001/g, '`http://${window.location.hostname}:3001');

// Replace the closing quote if it matches 3001/... '
content = content.replace(/3001\/([^']+)'/g, '3001/$1`');
// Wait, better yet, just replace 'http://localhost:3001/...' with `http://${window.location.hostname}:3001/...`
content = fs.readFileSync(targetFile, 'utf8');
content = content.replace(/'http:\/\/localhost:3001\/([^']+)'/g, '`http://${window.location.hostname}:3001/$1`');

fs.writeFileSync(targetFile, content);
console.log('Fixed URLs in AdminPanel.jsx');
