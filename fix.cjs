const fs = require('fs');
let code = fs.readFileSync('src/AdminPanel.jsx', 'utf8');
code = code.replace(/fetch\(`\//g, 'fetch(`https://app.goodfilmshop.com/');
fs.writeFileSync('src/AdminPanel.jsx', code);
