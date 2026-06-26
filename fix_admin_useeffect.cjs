const fs = require('fs');
const adminPath = 'src/AdminPanel.jsx';
let content = fs.readFileSync(adminPath, 'utf8');

const regex = /  useEffect\(\(\) => \{\s+const handleResize = \(\) => setIsMobile\(window\.innerWidth < 768\);\s+window\.addEventListener\('resize', handleResize\);\s+return \(\) => window\.removeEventListener\('resize', handleResize\);\s+useEffect\(\(\) => \{\s+const handleResize = \(\) => setIsMobile\(window\.innerWidth < 768\);\s+window\.addEventListener\('resize', handleResize\);\s+return \(\) => window\.removeEventListener\('resize', handleResize\);\s+\}, \[\]\);/g;

const replacement = `  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);`;

content = content.replace(regex, replacement);
fs.writeFileSync(adminPath, content, 'utf8');
console.log("Fixed useEffect duplication.");
