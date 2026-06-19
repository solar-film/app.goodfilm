const fs = require('fs');
let code = fs.readFileSync('src/AdminPanel.jsx', 'utf8');

// Chunk 1: States
code = code.replace(
  `const [newModel, setNewModel] = useState({ seriesId: '', name: '', color: '', shgc: '', vlt: '', reflectance: '', tser: '', uv: '' });`,
  `const [newModel, setNewModel] = useState({ seriesId: '', name: '', vlt: '', vlr: '', uv: '', ir: '', tser: '', thickness: '' });`
);

code = code.replace(
  `const [editModelData, setEditModelData] = useState({ name: '', color: '', shgc: '', vlt: '', reflectance: '', tser: '', uv: '' });`,
  `const [editModelData, setEditModelData] = useState({ name: '', vlt: '', vlr: '', uv: '', ir: '', tser: '', thickness: '' });`
);

// Chunk 2: handleEditModelClick
code = code.replace(
  `setEditModelData({ name: model.name, color: model.color, shgc: model.shgc, vlt: model.vlt, reflectance: model.reflectance, tser: model.tser, uv: model.uv });`,
  `setEditModelData({ name: model.name || '', vlt: model.specs?.vlt || '', vlr: model.specs?.vlr || '', uv: model.specs?.uv || '', ir: model.specs?.ir || '', tser: model.specs?.tser || '', thickness: model.specs?.thickness || '' });`
);

// Chunk 3: handleSaveEditModel
code = code.replace(
  `body: JSON.stringify({ ...currentModel, ...editModelData })`,
  `body: JSON.stringify({ ...currentModel, name: editModelData.name, specs: { vlt: editModelData.vlt, vlr: editModelData.vlr, uv: editModelData.uv, ir: editModelData.ir, tser: editModelData.tser, thickness: editModelData.thickness } })`
);

// Chunk 4: handleAddModel
code = code.replace(
  `body: JSON.stringify({ ...newModel, id: 'm-' + Date.now().toString() })`,
  `body: JSON.stringify({ id: 'm-' + Date.now().toString(), seriesId: newModel.seriesId, name: newModel.name, specs: { vlt: newModel.vlt, vlr: newModel.vlr, uv: newModel.uv, ir: newModel.ir, tser: newModel.tser, thickness: newModel.thickness } })`
);

code = code.replace(
  `setNewModel(p => ({ ...p, name: '', color: '', shgc: '', vlt: '', reflectance: '', tser: '', uv: '' }));`,
  `setNewModel(p => ({ ...p, name: '', vlt: '', vlr: '', uv: '', ir: '', tser: '', thickness: '' }));`
);

// Chunk 5: Form inputs
const regexForm = new RegExp("(<div>\\\\s*<label[^>]*>ชื่อรุ่น \\\\(Model\\\\)<\\\\/label>[\\\\s\\\\S]*?)<div style=\\{\\{ display: 'flex', alignItems: 'flex-end' \\}\\}>");

code = code.replace(regexForm, `<div>
              <label style={{ fontSize: '0.8rem' }}>ชื่อรุ่น (Model)</label>
              <input type="text" value={newModel.name} onChange={e => setNewModel({...newModel, name: e.target.value})} required className="form-control" placeholder="PR 70 EX" />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem' }}>แสงส่องผ่าน (VLT)</label>
              <input type="text" value={newModel.vlt} onChange={e => setNewModel({...newModel, vlt: e.target.value})} className="form-control" />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem' }}>สะท้อนแสง (VLR)</label>
              <input type="text" value={newModel.vlr} onChange={e => setNewModel({...newModel, vlr: e.target.value})} className="form-control" />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem' }}>กัน UV</label>
              <input type="text" value={newModel.uv} onChange={e => setNewModel({...newModel, uv: e.target.value})} className="form-control" />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem' }}>กันความร้อน (IR)</label>
              <input type="text" value={newModel.ir} onChange={e => setNewModel({...newModel, ir: e.target.value})} className="form-control" />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem' }}>ลดความร้อน (TSER)</label>
              <input type="text" value={newModel.tser} onChange={e => setNewModel({...newModel, tser: e.target.value})} className="form-control" />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem' }}>ความหนา</label>
              <input type="text" value={newModel.thickness} onChange={e => setNewModel({...newModel, thickness: e.target.value})} className="form-control" />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>`);

// Chunk 6: Table headers
const regexTableHeaders = new RegExp("<thead>\\\\s*<tr[^>]*>\\\\s*<th[^>]*>.*?<\\\\/th>\\\\s*<th[^>]*>.*?<\\\\/th>\\\\s*<th[^>]*>.*?<\\\\/th>\\\\s*<th[^>]*>.*?<\\\\/th>\\\\s*<th[^>]*>.*?<\\\\/th>\\\\s*<\\\\/tr>\\\\s*<\\\\/thead>");
code = code.replace(regexTableHeaders, `<thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                      <th style={{ padding: '0.5rem' }}>รุ่นฟิล์ม</th>
                      <th style={{ padding: '0.5rem' }}>VLT</th>
                      <th style={{ padding: '0.5rem' }}>VLR</th>
                      <th style={{ padding: '0.5rem' }}>UV</th>
                      <th style={{ padding: '0.5rem' }}>IR</th>
                      <th style={{ padding: '0.5rem' }}>TSER</th>
                      <th style={{ padding: '0.5rem' }}>หนา</th>
                      <th style={{ padding: '0.5rem' }}>จัดการ</th>
                    </tr>
                  </thead>`);

// Chunk 7: Table rows
const regexTableRowsEdit = new RegExp("<td style=\\{\\{ padding: '0\\\\.5rem' \\}\\}>\\\\s*<input type=\"text\" value=\\{editModelData\\\\.name\\}[\\\\s\\\\S]*?<\\\\/td>");
code = code.replace(regexTableRowsEdit, `<td style={{ padding: '0.5rem' }}><input type="text" value={editModelData.name} onChange={e => setEditModelData({...editModelData, name: e.target.value})} style={{...inputStyle, width: '100px'}} /></td>
                              <td style={{ padding: '0.5rem' }}><input type="text" value={editModelData.vlt} onChange={e => setEditModelData({...editModelData, vlt: e.target.value})} style={{...inputStyle, width: '50px'}} /></td>
                              <td style={{ padding: '0.5rem' }}><input type="text" value={editModelData.vlr} onChange={e => setEditModelData({...editModelData, vlr: e.target.value})} style={{...inputStyle, width: '50px'}} /></td>
                              <td style={{ padding: '0.5rem' }}><input type="text" value={editModelData.uv} onChange={e => setEditModelData({...editModelData, uv: e.target.value})} style={{...inputStyle, width: '50px'}} /></td>
                              <td style={{ padding: '0.5rem' }}><input type="text" value={editModelData.ir} onChange={e => setEditModelData({...editModelData, ir: e.target.value})} style={{...inputStyle, width: '50px'}} /></td>
                              <td style={{ padding: '0.5rem' }}><input type="text" value={editModelData.tser} onChange={e => setEditModelData({...editModelData, tser: e.target.value})} style={{...inputStyle, width: '50px'}} /></td>
                              <td style={{ padding: '0.5rem' }}><input type="text" value={editModelData.thickness} onChange={e => setEditModelData({...editModelData, thickness: e.target.value})} style={{...inputStyle, width: '60px'}} /></td>
                              <td style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem' }}>`);

// Chunk 8: Table rows view
const regexTableRowsView = new RegExp("<td style=\\{\\{ padding: '0\\\\.5rem' \\}\\}>\\{m\\\\.name\\}<\\\\/td>\\\\s*<td[^>]*>\\{m\\\\.color\\}<\\\\/td>\\\\s*<td[^>]*>\\{m\\\\.shgc\\}<\\\\/td>\\\\s*<td[^>]*>\\{m\\\\.vlt\\}<\\\\/td>\\\\s*<td[^>]*display: 'flex'[^>]*>");
code = code.replace(regexTableRowsView, `<td style={{ padding: '0.5rem' }}>{m.name}</td>
                              <td style={{ padding: '0.5rem' }}>{m.specs?.vlt || '-'}</td>
                              <td style={{ padding: '0.5rem' }}>{m.specs?.vlr || '-'}</td>
                              <td style={{ padding: '0.5rem' }}>{m.specs?.uv || '-'}</td>
                              <td style={{ padding: '0.5rem' }}>{m.specs?.ir || '-'}</td>
                              <td style={{ padding: '0.5rem' }}>{m.specs?.tser || '-'}</td>
                              <td style={{ padding: '0.5rem' }}>{m.specs?.thickness || '-'}</td>
                              <td style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem' }}>`);

fs.writeFileSync('src/AdminPanel.jsx', code);
console.log("Replaced!");
