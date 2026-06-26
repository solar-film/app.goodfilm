const fs = require('fs');
let code = fs.readFileSync('src/CatalogManager.jsx', 'utf8');

// 1. Add states
const stateInjection = `
  const [editingHeadersSeriesId, setEditingHeadersSeriesId] = useState(null);
  const [editHeadersData, setEditHeadersData] = useState({ shgc: 'SHGC', vlt: 'VLT', vlr: 'VLR', uv: 'UV', ir: 'IR', tser: 'TSER', thickness: 'หนา' });
`;
code = code.replace(
  "const [editingSeriesId, setEditingSeriesId] = useState(null);",
  stateInjection + "\n  const [editingSeriesId, setEditingSeriesId] = useState(null);"
);

// 2. Add save handler
const saveHandler = `
  const handleSaveHeaders = async () => {
    const targetSeries = seriesList.find(s => s.id === editingHeadersSeriesId);
    await fetch(\`https://nas.goodfilmshop.com/series/\${editingHeadersSeriesId}\`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...targetSeries, headers: editHeadersData })
    });
    setEditingHeadersSeriesId(null);
    onRefresh();
  };
`;
code = code.replace(
  "const handleSaveEditSeries = async () => {",
  saveHandler + "\n  const handleSaveEditSeries = async () => {"
);

// 3. Add "Edit Headers" button and Modal UI in the series render loop
const editHeadersBtn = `
                  <button onClick={() => { setEditingHeadersSeriesId(s.id); setEditHeadersData(s.headers || { shgc: 'SHGC', vlt: 'VLT', vlr: 'VLR', uv: 'UV', ir: 'IR', tser: 'TSER', thickness: 'หนา' }); }} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', padding: '0.3rem 0.6rem', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                    <Edit2 size={14} /> แก้ไขหัวตาราง
                  </button>
`;
code = code.replace(
  `<button onClick={() => handleEditClick(s)} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}><Edit2 size={14} /> แก้ไข</button>`,
  `<button onClick={() => handleEditClick(s)} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}><Edit2 size={14} /> แก้ไข</button>` + editHeadersBtn
);

// 4. Update the Table Headers rendering
code = code.replace(
  `<th>SHGC</th>
                            <th>VLT</th>
                            <th>VLR</th>
                            <th>UV</th>
                            <th>IR</th>
                            <th>TSER</th>
                            <th>หนา</th>`,
  `<th>{s.headers?.shgc || 'SHGC'}</th>
                            <th>{s.headers?.vlt || 'VLT'}</th>
                            <th>{s.headers?.vlr || 'VLR'}</th>
                            <th>{s.headers?.uv || 'UV'}</th>
                            <th>{s.headers?.ir || 'IR'}</th>
                            <th>{s.headers?.tser || 'TSER'}</th>
                            <th>{s.headers?.thickness || 'หนา'}</th>`
);

// 5. Add headers modal UI just before "if (editingSeriesId === s.id) {"
const headersModal = `
              {editingHeadersSeriesId === s.id && (
                <div style={{ padding: '1rem', backgroundColor: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)' }}>
                  <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>แก้ไขหัวตาราง - {s.title}</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: '500' }}>SHGC</label>
                      <input type="text" value={editHeadersData.shgc} onChange={e => setEditHeadersData({...editHeadersData, shgc: e.target.value})} className="form-control" />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: '500' }}>VLT</label>
                      <input type="text" value={editHeadersData.vlt} onChange={e => setEditHeadersData({...editHeadersData, vlt: e.target.value})} className="form-control" />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: '500' }}>VLR</label>
                      <input type="text" value={editHeadersData.vlr} onChange={e => setEditHeadersData({...editHeadersData, vlr: e.target.value})} className="form-control" />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: '500' }}>UV</label>
                      <input type="text" value={editHeadersData.uv} onChange={e => setEditHeadersData({...editHeadersData, uv: e.target.value})} className="form-control" />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: '500' }}>IR</label>
                      <input type="text" value={editHeadersData.ir} onChange={e => setEditHeadersData({...editHeadersData, ir: e.target.value})} className="form-control" />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: '500' }}>TSER</label>
                      <input type="text" value={editHeadersData.tser} onChange={e => setEditHeadersData({...editHeadersData, tser: e.target.value})} className="form-control" />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: '500' }}>หนา</label>
                      <input type="text" value={editHeadersData.thickness} onChange={e => setEditHeadersData({...editHeadersData, thickness: e.target.value})} className="form-control" />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={handleSaveHeaders} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Check size={16}/> บันทึก</button>
                    <button onClick={() => setEditingHeadersSeriesId(null)} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><X size={16}/> ยกเลิก</button>
                  </div>
                </div>
              )}
`;

code = code.replace(
  "{editingSeriesId === s.id ? (",
  headersModal + "\n              {editingSeriesId === s.id ? ("
);

// 6. Update Add Model Form labels
// We need to look up selectedSeriesForNewModel
const newModelSeriesLookup = `
                {(() => {
                  const s = seriesList.find(s => s.id === newModel.seriesId) || {};
                  const h = s.headers || {};
                  return (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ flex: '1 1 120px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '500' }}>{h.shgc || 'SHGC'}</label>
                        <input type="text" value={newModel.shgc} onChange={e => setNewModel({...newModel, shgc: e.target.value})} className="form-control" />
                      </div>
                      <div style={{ flex: '1 1 120px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '500' }}>{h.vlt || 'VLT'}</label>
                        <input type="text" value={newModel.vlt} onChange={e => setNewModel({...newModel, vlt: e.target.value})} className="form-control" />
                      </div>
                      <div style={{ flex: '1 1 120px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '500' }}>{h.vlr || 'VLR'}</label>
                        <input type="text" value={newModel.vlr} onChange={e => setNewModel({...newModel, vlr: e.target.value})} className="form-control" />
                      </div>
                      <div style={{ flex: '1 1 120px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '500' }}>{h.uv || 'UV'}</label>
                        <input type="text" value={newModel.uv} onChange={e => setNewModel({...newModel, uv: e.target.value})} className="form-control" />
                      </div>
                      <div style={{ flex: '1 1 120px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '500' }}>{h.ir || 'IR'}</label>
                        <input type="text" value={newModel.ir} onChange={e => setNewModel({...newModel, ir: e.target.value})} className="form-control" />
                      </div>
                      <div style={{ flex: '1 1 120px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '500' }}>{h.tser || 'TSER'}</label>
                        <input type="text" value={newModel.tser} onChange={e => setNewModel({...newModel, tser: e.target.value})} className="form-control" />
                      </div>
                      <div style={{ flex: '1 1 120px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '500' }}>{h.thickness || 'หนา'}</label>
                        <input type="text" value={newModel.thickness} onChange={e => setNewModel({...newModel, thickness: e.target.value})} className="form-control" />
                      </div>
                    </div>
                  );
                })()}
`;

// Find the input group in the Add Model form
// Currently it is like: <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}> ... <label ...>SHGC</label> ... </div>
// It's under <div style={{ flex: 1 }}> ... <label>ชื่อรุ่น</label> ... </div>
code = code.replace(
  /<div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>[\s\S]*?(?=<\/div>\s*<\/div>\s*<button type="submit")/m,
  newModelSeriesLookup + "                "
);

// 7. Update Edit Model Form labels (Inside the table)
const editModelSeriesLookup = `
                        {(() => {
                          const h = s.headers || {};
                          return (
                            <td colSpan="8" style={{ padding: '1rem', backgroundColor: 'var(--bg-color)' }}>
                              <h5 style={{ margin: '0 0 1rem 0' }}>แก้ไขข้อมูล {m.name}</h5>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                                <div><label style={{ fontSize: '0.8rem', fontWeight: '500' }}>ชื่อรุ่น</label><input type="text" value={editModelData.name} onChange={e => setEditModelData({...editModelData, name: e.target.value})} className="form-control" /></div>
                                <div><label style={{ fontSize: '0.8rem', fontWeight: '500' }}>{h.shgc || 'SHGC'}</label><input type="text" value={editModelData.shgc} onChange={e => setEditModelData({...editModelData, shgc: e.target.value})} className="form-control" /></div>
                                <div><label style={{ fontSize: '0.8rem', fontWeight: '500' }}>{h.vlt || 'VLT'}</label><input type="text" value={editModelData.vlt} onChange={e => setEditModelData({...editModelData, vlt: e.target.value})} className="form-control" /></div>
                                <div><label style={{ fontSize: '0.8rem', fontWeight: '500' }}>{h.vlr || 'VLR'}</label><input type="text" value={editModelData.vlr} onChange={e => setEditModelData({...editModelData, vlr: e.target.value})} className="form-control" /></div>
                                <div><label style={{ fontSize: '0.8rem', fontWeight: '500' }}>{h.uv || 'UV'}</label><input type="text" value={editModelData.uv} onChange={e => setEditModelData({...editModelData, uv: e.target.value})} className="form-control" /></div>
                                <div><label style={{ fontSize: '0.8rem', fontWeight: '500' }}>{h.ir || 'IR'}</label><input type="text" value={editModelData.ir} onChange={e => setEditModelData({...editModelData, ir: e.target.value})} className="form-control" /></div>
                                <div><label style={{ fontSize: '0.8rem', fontWeight: '500' }}>{h.tser || 'TSER'}</label><input type="text" value={editModelData.tser} onChange={e => setEditModelData({...editModelData, tser: e.target.value})} className="form-control" /></div>
                                <div><label style={{ fontSize: '0.8rem', fontWeight: '500' }}>{h.thickness || 'หนา'}</label><input type="text" value={editModelData.thickness} onChange={e => setEditModelData({...editModelData, thickness: e.target.value})} className="form-control" /></div>
                              </div>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={handleSaveEditModel} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Check size={16}/> บันทึก</button>
                                <button onClick={() => setEditingModelId(null)} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><X size={16}/> ยกเลิก</button>
                              </div>
                            </td>
                          );
                        })()}
`;

code = code.replace(
  /<td colSpan="8" style={{ padding: '1rem', backgroundColor: 'var\(--bg-color\)' }}>[\s\S]*?(?=<\/tr>)/m,
  editModelSeriesLookup + "                      "
);

fs.writeFileSync('src/CatalogManager.jsx', code, 'utf8');
console.log('CatalogManager headers logic added');
