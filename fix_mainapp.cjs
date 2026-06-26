const fs = require('fs');
const { execSync } = require('child_process');

// 1. Checkout MainApp.jsx
execSync('git checkout src/MainApp.jsx', { stdio: 'inherit' });

// 2. Read file
let content = fs.readFileSync('src/MainApp.jsx', 'utf8');

// 3. Re-apply useLocation fixes
content = content.replace(
  "import { useNavigate } from 'react-router-dom';",
  "import { useLocation, useNavigate } from 'react-router-dom';"
);

content = content.replace(
  "function MainApp() {\n  const navigate = useNavigate();\n  const [showWelcome, setShowWelcome] = useState(true);",
  "function MainApp() {\n  const navigate = useNavigate();\n  const location = useLocation();\n  const initialTab = location.state?.tab || 'home';\n  const [showWelcome, setShowWelcome] = useState(!location.state?.skipWelcome);"
);

content = content.replace(
  "const [currentTab, setCurrentTab] = useState('home'); // home, works, search, fav, profile",
  "const [currentTab, setCurrentTab] = useState(initialTab); // home, works, search, download, contact"
);

content = content.replace(
  "const [showCompareModal, setShowCompareModal] = useState(false);",
  "const [showCompareModal, setShowCompareModal] = useState(Boolean(location.state?.showCompare));"
);

// 4. Apply the button-to-icon fix
const oldButtonCode = `<h2 style={{ fontSize: '1.35rem', color: 'var(--primary-blue)', fontWeight: 'bold' }}>{section.title}</h2>
                  {section.id === 'bostik' && (
                    <button 
                      onClick={() => navigate('/bostik-presentation')}
                      style={{ 
                        marginTop: '10px', 
                        padding: '8px 16px', 
                        backgroundColor: '#eef4fb', 
                        color: '#1a4993', 
                        border: '1px solid #cce0f5', 
                        borderRadius: '20px', 
                        fontSize: '0.9rem', 
                        fontWeight: 'bold', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <BookOpen size={16} /> ข้อมูลผลิตภัณฑ์ BOSTIK
                    </button>
                  )}`;

const newButtonCode = `<h2 style={{ fontSize: '1.35rem', color: 'var(--primary-blue)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {section.title}
                    {section.id === 'bostik' && (
                      <span 
                        onClick={(e) => { e.stopPropagation(); navigate('/bostik-presentation'); }}
                        style={{ cursor: 'pointer', color: 'var(--primary-blue)', display: 'inline-flex', alignItems: 'center', backgroundColor: '#eef4fb', padding: '4px', borderRadius: '4px' }}
                        title="ข้อมูลผลิตภัณฑ์ BOSTIK (นำเสนอ)"
                      >
                        <BookOpen size={20} />
                      </span>
                    )}
                  </h2>`;

content = content.replace(oldButtonCode, newButtonCode);

fs.writeFileSync('src/MainApp.jsx', content, 'utf8');
console.log('Restored and patched MainApp.jsx successfully!');
