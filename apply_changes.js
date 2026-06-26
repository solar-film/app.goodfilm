const fs = require('fs');
let code = fs.readFileSync('src/CatalogManager.jsx', 'utf8');

// 1. UI for 'Edit Headers' button
const editBtnTarget = 'style={{ display: \'flex\', alignItems: \'center\', gap: \'0.2rem\', padding: \'0.3rem 0.6rem\', fontSize: \'0.8rem\' }}><Edit2 size={14} /> แก้ไข</button>';
const editBtnInject =                   <button onClick={() => { setEditingHeadersSeriesId(s.id); setEditHeadersData(s.headers || { shgc: 'SHGC', vlt: 'VLT', vlr: 'VLR', uv: 'UV', ir: 'IR', tser: 'TSER', thickness: 'หนา' }); }} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', padding: '0.3rem 0.6rem', fontSize: '0.8rem', marginLeft: '0.5rem' }}>\n                    <Edit2 size={14} /> แก้ไขหัวตาราง\n                  </button>;
if (!code.includes('แก้ไขหัวตาราง')) {
  code = code.replace(editBtnTarget, editBtnTarget + '\n' + editBtnInject);
}

// 2. State and Save Logic
const stateInjection =   const [editingHeadersSeriesId, setEditingHeadersSeriesId] = useState(null);
  const [editHeadersData, setEditHeadersData] = useState({ shgc: 'SHGC', vlt: 'VLT', vlr: 'VLR', uv: 'UV', ir: 'IR', tser: 'TSER', thickness: 'หนา' });;
if (!code.includes('editingHeadersSeriesId')) {
  code = code.replace("const [editingSeriesId", stateInjection + "\n  const [editingSeriesId");
}

const saveInjection =   const handleSaveHeaders = async (e) => {
    e.preventDefault();
    const targetSeries = seriesList.find(s => s.id === editingHeadersSeriesId);
    await fetch(\https://nas.goodfilmshop.com/series/\\, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...targetSeries, headers: editHeadersData })
    });
    setEditingHeadersSeriesId(null);
    onRefresh();
  };;
if (!code.includes('handleSaveHeaders')) {
  code = code.replace("const handleSaveEditSeries", saveInjection + "\n  const handleSaveEditSeries");
}

// 3. Modal UI
const modalInjection =               {editingHeadersSeriesId === s.id && (
                <div style={{ padding: '1rem', backgroundColor: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)' }}>
                  <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>แก้ไขหัวตาราง - {s.title}</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div><label style={{ fontSize: '0.8rem', fontWeight: '500' }}>SHGC</label><input type="text" value={editHeadersData.shgc} onChange={e => setEditHeadersData({...editHeadersData, shgc: e.target.value})} className="form-control" /></div>
                    <div><label style={{ fontSize: '0.8rem', fontWeight: '500' }}>VLT</label><input type="text" value={editHeadersData.vlt} onChange={e => setEditHeadersData({...editHeadersData, vlt: e.target.value})} className="form-control" /></div>
                    <div><label style={{ fontSize: '0.8rem', fontWeight: '500' }}>VLR</label><input type="text" value={editHeadersData.vlr} onChange={e => setEditHeadersData({...editHeadersData, vlr: e.target.value})} className="form-control" /></div>
                    <div><label style={{ fontSize: '0.8rem', fontWeight: '500' }}>UV</label><input type="text" value={editHeadersData.uv} onChange={e => setEditHeadersData({...editHeadersData, uv: e.target.value})} className="form-control" /></div>
                    <div><label style={{ fontSize: '0.8rem', fontWeight: '500' }}>IR</label><input type="text" value={editHeadersData.ir} onChange={e => setEditHeadersData({...editHeadersData, ir: e.target.value})} className="form-control" /></div>
                    <div><label style={{ fontSize: '0.8rem', fontWeight: '500' }}>TSER</label><input type="text" value={editHeadersData.tser} onChange={e => setEditHeadersData({...editHeadersData, tser: e.target.value})} className="form-control" /></div>
                    <div><label style={{ fontSize: '0.8rem', fontWeight: '500' }}>หนา</label><input type="text" value={editHeadersData.thickness} onChange={e => setEditHeadersData({...editHeadersData, thickness: e.target.value})} className="form-control" /></div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={handleSaveHeaders} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Check size={16}/> บันทึก</button>
                    <button onClick={() => setEditingHeadersSeriesId(null)} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><X size={16}/> ยกเลิก</button>
                  </div>
                </div>
              )};
if (!code.includes('แก้ไขหัวตาราง -')) {
  code = code.replace("{editingSeriesId === s.id ? (", modalInjection + "\n              {editingSeriesId === s.id ? (");
}

fs.writeFileSync('src/CatalogManager.jsx', code, 'utf8');
console.log('Patched');
