const fs = require('fs');
let code = fs.readFileSync('src/MainApp.jsx', 'utf8');

code = code.replace(
  '{seriesModels.length > 0 && (() => {',
  '{seriesModels.length > 0 && (() => {\\n            const isFilmSeries = ![\\'g6\\', \\'g7\\', \\'g8\\'].includes(selectedSeries.groupId);'
);

code = code.replace(
  '<SectionHeader \\n                  icon={Layers} \\n                  title="สเปคฟิล์ม" \\n                />',
  '{isFilmSeries && (\\n                  <SectionHeader \\n                    icon={Layers} \\n                    title="สเปคฟิล์ม" \\n                  />\\n                )}'
);

code = code.replace(
  '<div style={{ marginTop: \\'1rem\\', padding: \\'1.2rem\\', backgroundColor: \\'#f5f7fa\\', borderRadius: \\'12px\\', fontSize: \\'0.85rem\\', color: \\'#555\\', border: \\'1px solid #eaeaea\\' }}>\\n                  <h4 style={{ margin: \\'0 0 0.8rem 0\\', color: \\'var(--primary-blue)\\', fontSize: \\'0.95rem\\' }}>คำอธิบายค่าคุณสมบัติฟิล์ม</h4>',
  '{isFilmSeries && (hasSHGC || hasVLT || hasVLR || hasUV || hasIR || hasTSER || hasThickness) && (\\n                  <div style={{ marginTop: \\'1rem\\', padding: \\'1.2rem\\', backgroundColor: \\'#f5f7fa\\', borderRadius: \\'12px\\', fontSize: \\'0.85rem\\', color: \\'#555\\', border: \\'1px solid #eaeaea\\' }}>\\n                    <h4 style={{ margin: \\'0 0 0.8rem 0\\', color: \\'var(--primary-blue)\\', fontSize: \\'0.95rem\\' }}>คำอธิบายค่าคุณสมบัติฟิล์ม</h4>'
);

code = code.replace(
  '{hasThickness && <li><strong>ความหนา:</strong> หน่วยเป็น Mil (1 Mil = 0.0254 มม.)</li>}\\n                  </ul>\\n                </div>\\n              </div>',
  '{hasThickness && <li><strong>ความหนา:</strong> หน่วยเป็น Mil (1 Mil = 0.0254 มม.)</li>}\\n                  </ul>\\n                </div>\\n                )}\\n              </div>'
);

fs.writeFileSync('src/MainApp.jsx', code, 'utf8');
console.log('Done');
