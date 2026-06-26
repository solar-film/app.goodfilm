const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'BostikPage.jsx');
let content = fs.readFileSync(file, 'utf8');

const targetStr = `</div>

      </div>
      <nav className="bottom-nav">`;

const replacementStr = `</div>

        <h2 style={{ fontSize: '1.4rem', color: '#333', borderBottom: '2px solid #eaeaea', paddingBottom: '10px', marginBottom: '20px', marginTop: '40px' }}>📑 สไลด์นำเสนอฉบับเต็ม (Full Presentation)</h2>
        <div style={{ width: '100%', height: '600px', backgroundColor: '#f0f0f0', borderRadius: '12px', overflow: 'hidden', border: '1px solid #ddd', marginBottom: '40px' }}>
          <iframe src="/assets/bostik/presentation.pdf" width="100%" height="100%" style={{ border: 'none' }} title="Bostik Presentation"></iframe>
        </div>

        <h2 style={{ fontSize: '1.4rem', color: '#333', borderBottom: '2px solid #eaeaea', paddingBottom: '10px', marginBottom: '20px', marginTop: '40px' }}>🎥 วิดีโอสาธิตการทดสอบ (Test Procedures Videos)</h2>
        <p style={{ color: '#555', lineHeight: '1.6', marginBottom: '20px' }}>
          รับชมวิดีโอสาธิตขั้นตอนการทดสอบผลิตภัณฑ์ Bostik อย่างละเอียด เพื่อความมั่นใจในคุณภาพ (จากสไลด์หน้า 24-30)
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          {[
            { file: 'media5.mp4', label: 'Extrusion Rate Test' },
            { file: 'media6.mp4', label: 'Density Test' },
            { file: 'media9.mp4', label: 'Shore-A Hardness Test' },
            { file: 'media7.MP4', label: 'Tensile Strength Test' },
            { file: 'media1.mp4', label: 'Elongation at Break Test' },
            { file: 'media8.mp4', label: 'E-Modulus Test' },
            { file: 'media2.mp4', label: 'Tack-free Time Test' },
            { file: 'media3.mp4', label: 'Adhesion in Peel Test' },
            { file: 'media4.mp4', label: 'Movement Capability Test' },
          ].map((vid, idx) => (
            <div key={idx} style={{ backgroundColor: 'black', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
              <video width="100%" height="200" controls preload="none" poster="/logo-app.png">
                <source src={\`/assets/bostik/videos/ppt/media/\${vid.file}\`} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div style={{ padding: '10px', backgroundColor: 'white', borderTop: '1px solid #eee' }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#333', textAlign: 'center' }}>{vid.label}</h4>
              </div>
            </div>
          ))}
        </div>

      </div>
      <nav className="bottom-nav">`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync(file, content, 'utf8');
  console.log("Patched successfully!");
} else {
  console.log("Target string not found!");
}
