import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, Check, X } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

function CatalogManager({ allowedGroupIds, groupsList, seriesList, modelsList, onRefresh, onDelete }) {
  const availableGroups = allowedGroupIds ? groupsList.filter(g => allowedGroupIds.includes(g.id)) : groupsList;
  const defaultGroupId = allowedGroupIds ? allowedGroupIds[0] : 'g1';
  const [newSeries, setNewSeries] = useState({ title: '', desc: '', longDesc: '', groupId: defaultGroupId });
  const [newModel, setNewModel] = useState({ seriesId: '', name: '', shgc: '', vlt: '', vlr: '', uv: '', ir: '', tser: '', thickness: '' });
  
  const [editingSeriesId, setEditingSeriesId] = useState(null);
  const [editSeriesData, setEditSeriesData] = useState({ title: '', desc: '', longDesc: '', groupId: '' });

  const [editingModelId, setEditingModelId] = useState(null);
  const [editModelData, setEditModelData] = useState({ name: '', shgc: '', vlt: '', vlr: '', uv: '', ir: '', tser: '', thickness: '' });

  const [filterGroup, setFilterGroup] = useState('');
  const [searchSeries, setSearchSeries] = useState('');
  const [searchModel, setSearchModel] = useState('');

  const filteredSeriesList = seriesList.filter(s => {
    const matchGroup = filterGroup === '' ? (allowedGroupIds ? allowedGroupIds.includes(s.groupId) : true) : s.groupId === filterGroup;
    const matchSearch = searchSeries === '' || 
      s.title.toLowerCase().includes(searchSeries.toLowerCase()) || 
      s.desc.toLowerCase().includes(searchSeries.toLowerCase());
    return matchGroup && matchSearch;
  });

  const handleEditClick = (series) => {
    setEditingSeriesId(series.id);
    setEditSeriesData({ title: series.title, desc: series.desc, longDesc: series.longDesc || '', groupId: series.groupId || 'g1' });
  };

  const handleSaveEditSeries = async () => {
    try {
      const currentSeries = seriesList.find(s => s.id === editingSeriesId);
      await fetch(`https://nas.goodfilmshop.com/series/${editingSeriesId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...currentSeries, ...editSeriesData })
      });
      setEditingSeriesId(null);
      onRefresh();
    } catch (err) {
      alert('ไม่สามารถบันทึกได้');
    }
  };

  const handleEditModelClick = (model) => {
    setEditingModelId(model.id);
    setEditModelData({ name: model.name || '', shgc: model.shgc || '', vlt: model.vlt || '', vlr: model.vlr || model.reflectance || '', uv: model.uv || '', ir: model.ir || '', tser: model.tser || '', thickness: model.thickness || '' });
  };

  const handleSaveEditModel = async () => {
    try {
      const currentModel = modelsList.find(m => m.id === editingModelId);
      await fetch(`https://nas.goodfilmshop.com/models/${editingModelId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...currentModel, name: editModelData.name, shgc: editModelData.shgc, vlt: editModelData.vlt, vlr: editModelData.vlr, reflectance: editModelData.vlr, uv: editModelData.uv, ir: editModelData.ir, tser: editModelData.tser, thickness: editModelData.thickness })
      });
      setEditingModelId(null);
      onRefresh();
    } catch (err) {
      alert('ไม่สามารถบันทึกได้');
    }
  };
  
  useEffect(() => {
    if (seriesList.length > 0 && !newModel.seriesId) setNewModel(p => ({ ...p, seriesId: seriesList[0].id }));
  }, [seriesList]);

  const handleAddSeries = async (e) => {
    e.preventDefault();
    await fetch(`https://nas.goodfilmshop.com/series`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newSeries, id: 's-' + Date.now().toString(), referenceFile: '' })
    });
    setNewSeries({ title: '', desc: '', longDesc: '', groupId: 'g1' });
    e.target.reset();
    onRefresh();
  };

  const handleAddModel = async (e) => {
    e.preventDefault();
    await fetch(`https://nas.goodfilmshop.com/models`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'm-' + Date.now().toString(), seriesId: newModel.seriesId, name: newModel.name, shgc: newModel.shgc, vlt: newModel.vlt, vlr: newModel.vlr, reflectance: newModel.vlr, uv: newModel.uv, ir: newModel.ir, tser: newModel.tser, thickness: newModel.thickness })
    });
    setNewModel(p => ({ ...p, name: '', shgc: '', vlt: '', vlr: '', uv: '', ir: '', tser: '', thickness: '' }));
    e.target.reset();
    onRefresh();
  };

  const inputStyle = { width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      
      {/* Series Section */}
      <section className="admin-grid">
        <div className="premium-card" style={{ padding: '1.5rem', alignSelf: 'start' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--primary-blue)' }}>เพิ่มรุ่นฟิล์ม (Series)</h3>
          <form onSubmit={handleAddSeries} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '500' }}>ชื่อ Series</label>
                <input type="text" value={newSeries.title} onChange={e => setNewSeries({...newSeries, title: e.target.value})} required className="form-control" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '500' }}>กลุ่มผลิตภัณฑ์</label>
                <select value={newSeries.groupId} onChange={e => setNewSeries({...newSeries, groupId: e.target.value})} required className="form-control">
                  {availableGroups?.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
                </select>
              </div>
              <div style={{ flex: 2 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '500' }}>คำอธิบายสั้นๆ</label>
                <input type="text" value={newSeries.desc} onChange={e => setNewSeries({...newSeries, desc: e.target.value})} required className="form-control" />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '500' }}>คำอธิบายแบบยาว (รองรับ HTML)</label>
              <div style={{ backgroundColor: 'white', borderRadius: '4px', marginTop: '0.2rem' }}>
                <ReactQuill theme="snow" value={newSeries.longDesc || ''} onChange={(val) => setNewSeries({...newSeries, longDesc: val})} style={{ minHeight: '150px' }} placeholder="สามารถพิมพ์ข้อความธรรมดา หรือจัดรูปแบบตัวหนา ตัวเอียง ฯลฯ ได้เหมือน Word" />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', minWidth: '120px' }}>+ เพิ่ม Series</button>
            </div>
          </form>
        </div>
        
        <div>
          <h3 style={{ marginBottom: '1rem', color: 'var(--primary-blue)' }}>รายการรุ่นฟิล์ม (Series)</h3>
        <hr style={{ margin: '2rem 0', border: 'none', borderTop: '1px solid #ddd' }} />
        
        <div style={{ backgroundColor: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', border: '1px solid #eee' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem', color: '#555' }}>🔍 ค้นหาชื่อรุ่นฟิล์ม</label>
            <input type="text" className="form-control" placeholder="พิมพ์ชื่อรุ่น หรือคำอธิบาย..." value={searchSeries} onChange={e => setSearchSeries(e.target.value)} />
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem', color: '#555' }}>📁 กรองตามกลุ่มผลิตภัณฑ์</label>
            <select className="form-control" value={filterGroup} onChange={e => setFilterGroup(e.target.value)}>
              <option value="">-- แสดงทุกกลุ่มผลิตภัณฑ์ --</option>
              {availableGroups?.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
            </select>
          </div>
        </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredSeriesList.map(series => {
            const isEditing = editingSeriesId === series.id;
            return (
              <div key={series.id} className="premium-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                {isEditing ? (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <input type="text" value={editSeriesData.title} onChange={e => setEditSeriesData({...editSeriesData, title: e.target.value})} className="form-control" placeholder="ชื่อ Series" />
                    <input type="text" value={editSeriesData.desc} onChange={e => setEditSeriesData({...editSeriesData, desc: e.target.value})} className="form-control" placeholder="คำอธิบายสั้นๆ" />
                    <select value={editSeriesData.groupId} onChange={e => setEditSeriesData({...editSeriesData, groupId: e.target.value})} className="form-control" style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                      {availableGroups?.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
                    </select>
                    <div style={{ backgroundColor: 'white' }}>
                      <ReactQuill theme="snow" value={editSeriesData.longDesc || ''} onChange={(val) => setEditSeriesData({...editSeriesData, longDesc: val})} style={{ minHeight: '200px' }} placeholder="คำอธิบายแบบยาว" />
                    </div>
                  </div>
                ) : (
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: '1.1rem' }}>{series.title}</strong>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>{series.desc}</p>
                  </div>
                )}
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {isEditing ? (
                    <>
                      <button onClick={handleSaveEditSeries} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem' }}>บันทึก</button>
                      <button onClick={() => setEditingSeriesId(null)} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem' }}>ยกเลิก</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEditClick(series)} className="btn btn-outline" style={{ borderColor: 'var(--primary-blue)', color: 'var(--primary-blue)', padding: '0.4rem 0.8rem' }}>แก้ไข</button>
                      <button onClick={() => onDelete('series', series.id)} className="btn btn-outline" style={{ borderColor: 'red', color: 'red', padding: '0.4rem 0.8rem' }}>ลบ</button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        </div>
      </section>

      {/* Models Section */}
      <section className="admin-grid">
        <div className="premium-card" style={{ padding: '1.5rem', alignSelf: 'start' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--primary-blue)' }}>เพิ่มสเปคโมเดล</h3>
          <form onSubmit={handleAddModel} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#333', marginBottom: '0.4rem', display: 'block' }}>เพิ่มใน Series</label>
              <select value={newModel.seriesId} onChange={e => setNewModel({...newModel, seriesId: e.target.value})} className="form-control" style={{ width: '100%' }}>
                {seriesList.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#333', marginBottom: '0.4rem', display: 'block' }}>ชื่อรุ่น (Model)</label>
              <input type="text" value={newModel.name} onChange={e => setNewModel({...newModel, name: e.target.value})} required className="form-control" placeholder="เช่น PR 70 EX" style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#555', marginBottom: '0.4rem', display: 'block' }}>ค่า SHGC</label>
              <input type="text" value={newModel.shgc} onChange={e => setNewModel({...newModel, shgc: e.target.value})} className="form-control" placeholder="0.38" style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#555', marginBottom: '0.4rem', display: 'block' }}>แสงผ่าน (VLT)</label>
              <input type="text" value={newModel.vlt} onChange={e => setNewModel({...newModel, vlt: e.target.value})} className="form-control" placeholder="6%" style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#555', marginBottom: '0.4rem', display: 'block' }}>สะท้อน (VLR)</label>
              <input type="text" value={newModel.vlr} onChange={e => setNewModel({...newModel, vlr: e.target.value})} className="form-control" placeholder="8%" style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#555', marginBottom: '0.4rem', display: 'block' }}>กัน UV</label>
              <input type="text" value={newModel.uv} onChange={e => setNewModel({...newModel, uv: e.target.value})} className="form-control" placeholder="99%" style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#555', marginBottom: '0.4rem', display: 'block' }}>กันร้อน (IR)</label>
              <input type="text" value={newModel.ir} onChange={e => setNewModel({...newModel, ir: e.target.value})} className="form-control" placeholder="97%" style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#555', marginBottom: '0.4rem', display: 'block' }}>ลดร้อน (TSER)</label>
              <input type="text" value={newModel.tser} onChange={e => setNewModel({...newModel, tser: e.target.value})} className="form-control" placeholder="60%" style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#555', marginBottom: '0.4rem', display: 'block' }}>ความหนา</label>
              <input type="text" value={newModel.thickness} onChange={e => setNewModel({...newModel, thickness: e.target.value})} className="form-control" placeholder="2 mil" style={{ width: '100%' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.7rem', fontWeight: 'bold', borderRadius: '8px' }}>+ เพิ่มโมเดล</button>
            </div>
          </form>
        </div>
        
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: 'var(--primary-blue)' }}>รายการสเปคโมเดลย่อย (Models)</h3>
          </div>
          <div style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #eee' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem', color: '#555' }}>🔍 ค้นหาชื่อรุ่น (Model)</label>
            <input type="text" className="form-control" placeholder="พิมพ์ชื่อรุ่น เช่น PR 70 EX..." value={searchModel} onChange={e => setSearchModel(e.target.value)} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {filteredSeriesList.map(series => {
            const models = modelsList.filter(m => m.seriesId === series.id && (searchModel === '' || (m.name && m.name.toLowerCase().includes(searchModel.toLowerCase()))));
            if (models.length === 0) return null;
            return (
              <div key={series.id} className="premium-card" style={{ padding: '1rem' }}>
                <h4 style={{ marginBottom: '0.5rem', borderBottom: '1px solid #ddd', paddingBottom: '0.5rem' }}>{series.title}</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                      <th style={{ padding: '0.5rem' }}>รุ่น</th>
                      <th style={{ padding: '0.5rem' }}>SHGC</th>
                      <th style={{ padding: '0.5rem' }}>VLT</th>
                      <th style={{ padding: '0.5rem' }}>VLR</th>
                      <th style={{ padding: '0.5rem' }}>UV</th>
                      <th style={{ padding: '0.5rem' }}>IR</th>
                      <th style={{ padding: '0.5rem' }}>TSER</th>
                      <th style={{ padding: '0.5rem' }}>หนา</th>
                      <th style={{ padding: '0.5rem' }}>จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {models.map(m => {
                      const isEditingModel = editingModelId === m.id;
                      return (
                        <tr key={m.id} style={{ borderBottom: '1px solid #eee' }}>
                          {isEditingModel ? (
                            <>
                              <td style={{ padding: '0.5rem' }}><input type="text" value={editModelData.name} onChange={e => setEditModelData({...editModelData, name: e.target.value})} style={{...inputStyle, width: '80px'}} /></td>
                              <td style={{ padding: '0.5rem' }}><input type="text" value={editModelData.shgc} onChange={e => setEditModelData({...editModelData, shgc: e.target.value})} style={{...inputStyle, width: '40px'}} /></td>
                              <td style={{ padding: '0.5rem' }}><input type="text" value={editModelData.vlt} onChange={e => setEditModelData({...editModelData, vlt: e.target.value})} style={{...inputStyle, width: '40px'}} /></td>
                              <td style={{ padding: '0.5rem' }}><input type="text" value={editModelData.vlr} onChange={e => setEditModelData({...editModelData, vlr: e.target.value})} style={{...inputStyle, width: '40px'}} /></td>
                              <td style={{ padding: '0.5rem' }}><input type="text" value={editModelData.uv} onChange={e => setEditModelData({...editModelData, uv: e.target.value})} style={{...inputStyle, width: '40px'}} /></td>
                              <td style={{ padding: '0.5rem' }}><input type="text" value={editModelData.ir} onChange={e => setEditModelData({...editModelData, ir: e.target.value})} style={{...inputStyle, width: '40px'}} /></td>
                              <td style={{ padding: '0.5rem' }}><input type="text" value={editModelData.tser} onChange={e => setEditModelData({...editModelData, tser: e.target.value})} style={{...inputStyle, width: '40px'}} /></td>
                              <td style={{ padding: '0.5rem' }}><input type="text" value={editModelData.thickness} onChange={e => setEditModelData({...editModelData, thickness: e.target.value})} style={{...inputStyle, width: '60px'}} /></td>
                              <td style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                                <button onClick={handleSaveEditModel} style={{ color: 'var(--primary-blue)', border: 'none', background: 'none', cursor: 'pointer' }}>บันทึก</button>
                                <button onClick={() => setEditingModelId(null)} style={{ color: 'var(--text-muted)', border: 'none', background: 'none', cursor: 'pointer' }}>ยกเลิก</button>
                              </td>
                            </>
                          ) : (
                            <>
                              <td style={{ padding: '0.5rem' }}>{m.name}</td>
                              <td style={{ padding: '0.5rem' }}>{m.shgc || '-'}</td>
                              <td style={{ padding: '0.5rem' }}>{m.vlt || '-'}</td>
                              <td style={{ padding: '0.5rem' }}>{m.vlr || m.reflectance || '-'}</td>
                              <td style={{ padding: '0.5rem' }}>{m.uv || '-'}</td>
                              <td style={{ padding: '0.5rem' }}>{m.ir || '-'}</td>
                              <td style={{ padding: '0.5rem' }}>{m.tser || '-'}</td>
                              <td style={{ padding: '0.5rem' }}>{m.thickness || '-'}</td>
                              <td style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => handleEditModelClick(m)} style={{ color: 'var(--primary-blue)', border: 'none', background: 'none', cursor: 'pointer' }}>แก้ไข</button>
                                <button onClick={() => onDelete('models', m.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>ลบ</button>
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
        </div>
      </section>

    </div>
  );
}

// --- DOWNLOAD MANAGER ---

export default CatalogManager;
