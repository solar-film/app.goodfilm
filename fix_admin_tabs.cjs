const fs = require('fs');
const adminPath = 'src/AdminPanel.jsx';
let content = fs.readFileSync(adminPath, 'utf8');

const regex = /<Youtube size=\{18\} \/>.*?- YouTube/g;
const replacement = '<Youtube size={18} /> จัดการวิดีโอ YouTube';

content = content.replace(regex, replacement);

const regex2 = /<ImageIcon size=\{18\} \/>.*?(<\/button>)/;
const replacement2 = '<ImageIcon size={18} /> จัดการรูปตัวอย่างสินค้า$1';

if (regex2.test(content)) {
    content = content.replace(regex2, replacement2);
}

fs.writeFileSync(adminPath, content, 'utf8');
console.log("Fixed tab names.");
