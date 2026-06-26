const fs = require('fs');
let code = fs.readFileSync('src/MainApp.jsx', 'utf8');

const tableHeaders = `                        {selectedSeries.groupId === 'g1' && <th style={{ padding: '0.75rem', borderRadius: '8px 0 0 0', width: '50px' }}>เปรียบเทียบ</th>}
                        <th style={{ padding: '0.75rem', borderRadius: selectedSeries.groupId === 'g1' ? '0' : '8px 0 0 0' }}>ชื่อรุ่น</th>
                        {hasSHGC && <th style={{ padding: '0.75rem' }}>{selectedSeries.headers?.shgc || 'SHGC'}</th>}
                        {hasVLT && <th style={{ padding: '0.75rem' }}>{selectedSeries.headers?.vlt || 'VLT'}</th>}
                        {hasVLR && <th style={{ padding: '0.75rem' }}>{selectedSeries.headers?.vlr || 'VLR'}</th>}
                        {hasUV && <th style={{ padding: '0.75rem' }}>{selectedSeries.headers?.uv || 'UV'}</th>}
                        {hasIR && <th style={{ padding: '0.75rem' }}>{selectedSeries.headers?.ir || 'IR'}</th>}
                        {hasTSER && <th style={{ padding: '0.75rem' }}>{selectedSeries.headers?.tser || 'TSER'}</th>}
                        {hasThickness && <th style={{ padding: '0.75rem', borderRadius: '0 8px 0 0' }}>{selectedSeries.headers?.thickness || 'หนา'}</th>}`;

code = code.replace(
  /\{selectedSeries\.groupId === 'g1' && <th style=\{\{ padding: '0\.75rem', borderRadius: '8px 0 0 0', width: '50px' \}\}>.*<\/th>\}[\s\S]*?\{hasThickness && <th style=\{\{ padding: '0\.75rem', borderRadius: '0 8px 0 0' \}\}>.*<\/th>\}/,
  tableHeaders
);

fs.writeFileSync('src/MainApp.jsx', code, 'utf8');
console.log('MainApp headers patched');
