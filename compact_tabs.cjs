const fs = require('fs');
let code = fs.readFileSync('src/AdminPanel.jsx', 'utf8');

// Replace gap in the tab container
code = code.replace(
  "gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid \\nvar(--border-color)', paddingBottom: '1rem', flexWrap: 'wrap'",
  "gap: '0.5rem', marginBottom: '2rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '1rem', flexWrap: 'wrap'"
);
// Sometimes it doesn't have a newline
code = code.replace(
  "gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '1rem', flexWrap: 'wrap'",
  "gap: '0.5rem', marginBottom: '2rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '1rem', flexWrap: 'wrap'"
);

// Add compact padding to all tab buttons
code = code.replace(
  /style={{ display: 'flex', alignItems: 'center', gap: '0\.5rem' }}/g,
  "style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.9rem' }}"
);

fs.writeFileSync('src/AdminPanel.jsx', code, 'utf8');
console.log('AdminPanel compacted');
