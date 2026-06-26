const fs = require('fs');
const adminPath = 'src/AdminPanel.jsx';
let content = fs.readFileSync(adminPath, 'utf8');

// Fix the corrupted error messages
content = content.replace(/setStatus\(response\.status === 429 \? '.*?' : \n'.*?'\);/s, "setStatus(response.status === 429 ? 'เข้าสู่ระบบผิดพลาดเกินกำหนด กรุณารอสักครู่' : 'รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่');");
content = content.replace(/setStatus\('.*?'\);/, "setStatus('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');");
content = content.replace(/<h1.*?>.*?<\/h1>/, "<h1 style={{ color: 'var(--primary-blue)', fontSize: '1.6rem', marginBottom: '0.5rem' }}>เข้าสู่ระบบจัดการข้อมูล</h1>");
content = content.replace(/<p style={{ color: 'var(--text-muted)'.*?>.*?<\/p>/, "<p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>กรุณาใส่รหัสผ่านเพื่อเข้าใช้งานระบบ</p>");
content = content.replace(/<label htmlFor="admin-password".*?>.*?<\/label>/, "<label htmlFor=\"admin-password\" style={{ display: 'block', fontWeight: '700', marginBottom: '0.5rem' }}>รหัสผ่าน</label>");
content = content.replace(/<button\s+type="submit"[^>]*>.*?<\/button>/s, '<button type="submit" className="btn btn-primary" style={{ width: \'100%\', padding: \'0.8rem\', fontSize: \'1rem\' }} disabled={submitting}>{submitting ? \'กำลังเข้าสู่ระบบ...\' : \'เข้าสู่ระบบ\'}</button>');
content = content.replace(/<button\s+className="btn btn-outline"\s+onClick=\{async \(\) => \{\s+await apiFetch\('\/auth\/logout', \{ method: 'POST' \}\);\s+setAuthState\('anonymous'\);\s+\}\}\s*>\s*.*?\s*<\/button>/s, `<button 
              className="btn btn-outline"
              onClick={async () => {
                await apiFetch('/auth/logout', { method: 'POST' });
                setAuthState('anonymous');
              }}
            >
              ออกจากระบบ
            </button>`);

fs.writeFileSync(adminPath, content, 'utf8');
console.log('Fixed Thai text');
