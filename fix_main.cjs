const fs = require('fs');

const mainAppPath = 'src/MainApp.jsx';
let content = fs.readFileSync(mainAppPath, 'utf8');

const target1 = ".then(([g, s, m, p, d, b]) => {";
const rep1 = ".then(([g, s, m, p, d, b, v]) => {";
content = content.replace(target1, rep1);

const target2 = "setBannersList(b);";
const rep2 = "setBannersList(b);\n        setVideosList(v);";
content = content.replace(target2, rep2);

fs.writeFileSync(mainAppPath, content, 'utf8');
console.log("MainApp.jsx fix applied.");
