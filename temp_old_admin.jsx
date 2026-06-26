import PortfolioManager from './PortfolioManager';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, FileText, Image as ImageIcon, Download, Edit2, Check, X } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import './App.css';

const getFullUrl = (path) => {
  if (!path) return path;
  if (path.startsWith('/')) {
    return `https://nas.goodfilmshop.com${path}`;
  }
  return path;
};

function AdminPanel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('portfolio'); // 'portfolio' | 'catalog' | 'downloads' | 'banners'
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Data State
  const [groupsList, setGroupsList] = useState([]);
  const [seriesList, setSeriesList] = useState([]);
  const [modelsList, setModelsList] = useState([]);
  const [portfolioList, setPortfolioList] = useState([]);
  const [downloadsList, setDownloadsList] = useState([]);
  const [bannersList, setBannersList] = useState([]);
  
  const loadData = () => {
    const ts = Date.now();
    fetch(`https://nas.goodfilmshop.com/groups?_=${ts}`).then(r => r.json()).then(setGroupsList);
    fetch(`https://nas.goodfilmshop.com/series?_=${ts}`).then(r => r.json()).then(setSeriesList);
    fetch(`https://nas.goodfilmshop.com/models?_=${ts}`).then(r => r.json()).then(m => setModelsList(m.sort((a, b) => {
      const numA = parseInt(a.name.match(/\d+/)?.[0] || 0);
      const numB = parseInt(b.name.match(/\d+/)?.[0] || 0);
      return numA - numB;
    })));
    fetch(`https://nas.goodfilmshop.com/portfolio?_=${ts}`).then(r => r.json()).then(setPortfolioList);
    fetch(`https://nas.goodfilmshop.com/downloads?_=${ts}`).then(r => r.json()).then(setDownloadsList);
    fetch(`https://nas.goodfilmshop.com/banners?_=${ts}`).then(r => r.json()).then(setBannersList);
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isMobile) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', marginTop: '20vh' }}>
        <h2 style={{ color: 'var(--primary-blue)', marginBottom: '1rem' }}>α╕úα╕░α╕Üα╕Üα╕êα╕▒α╕öα╕üα╕▓α╕ú (Admin)</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem' }}>α╕üα╕úα╕╕α╕ôα╕▓α╣Çα╕éα╣ëα╕▓α╣âα╕èα╣ëα╕çα╕▓α╕Öα╕£α╣êα╕▓α╕Öα╕½α╕Öα╣ëα╕▓α╕êα╕¡α╕äα╕¡α╕íα╕₧α╕┤α╕ºα╣Çα╕òα╕¡α╕úα╣îα╣Çα╕ùα╣êα╕▓α╕Öα╕▒α╣ëα╕Ö</p>
        <button onClick={() => navigate('/')} className="btn btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1.1rem', borderRadius: '12px' }}>α╕üα╕Ñα╕▒α╕Üα╕¬α╕╣α╣êα╕½α╕Öα╣ëα╕▓α╕½α╕Ñα╕▒α╕ü</button>
      </div>
    );
  }

  const handleDelete = async (endpoint, id) => {
    if (!window.confirm('α╕äα╕╕α╕ôα╣üα╕Öα╣êα╣âα╕êα╕½α╕úα╕╖α╕¡α╣äα╕íα╣êα╕ùα╕╡α╣êα╕êα╕░α╕Ñα╕Üα╕úα╕▓α╕óα╕üα╕▓α╕úα╕Öα╕╡α╣ë?')) return;
    try {
      await fetch(`https://nas.goodfilmshop.com/${endpoint}/${id}`, { method: 'DELETE' });
      loadData();
    } catch (error) {
      console.error(error);
      alert('α╕Ñα╕Üα╣äα╕íα╣êα╕¬α╕│α╣Çα╕úα╣çα╕ê');
    }
  };

  return (
    <div className="app-container" style={{ minHeight: '100vh', background: 'var(--bg-light)' }}>
      <header className="app-header" style={{ position: 'relative' }}>
        <div className="nav-container">
          <div onClick={() => navigate('/')} style={{ cursor: 'pointer', color: 'var(--primary-blue)', fontWeight: '500' }}>
            <span>&larr; α╕üα╕Ñα╕▒α╕Üα╕½α╕Öα╣ëα╕▓α╣üα╕úα╕ü</span>
          </div>
          <h2 style={{ color: 'var(--primary-blue)', margin: 0, fontSize: '1.2rem' }}>α╕úα╕░α╕Üα╕Üα╕êα╕▒α╕öα╕üα╕▓α╕úα╕½α╕Ñα╕▒α╕çα╕Üα╣ëα╕▓α╕Ö (CMS)</h2>
          <div style={{ width: '100px' }}></div>
        </div>
      </header>

      <div className="container" style={{ maxWidth: '1400px', marginTop: '2rem', padding: '0 1rem', paddingBottom: '3rem' }}>
        
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '1rem', flexWrap: 'wrap' }}>
          <button 
            className={`btn ${activeTab === 'portfolio' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('portfolio')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <ImageIcon size={18} /> α╕êα╕▒α╕öα╕üα╕▓α╕úα╕úα╕╣α╕¢α╕£α╕Ñα╕çα╕▓α╕Ö
          </button>
          <button 
            className={`btn ${activeTab === 'catalog' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('catalog')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <FileText size={18} /> α╕êα╕▒α╕öα╕üα╕▓α╕úα╕úα╕╕α╣êα╕Öα╕ƒα╕┤α╕Ñα╣îα╕íα╣üα╕Ñα╕░α╕¬α╣Çα╕¢α╕ä
          </button>
          <button 
            className={`btn ${activeTab === 'downloads' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('downloads')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Download size={18} /> α╕êα╕▒α╕öα╕üα╕▓α╕úα╣äα╕ƒα╕Ñα╣îα╕öα╕▓α╕ºα╕Öα╣îα╣éα╕½α╕Ñα╕ö
          </button>
          <button 
            className={`btn ${activeTab === 'banners' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('banners')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <ImageIcon size={18} /> α╕êα╕▒α╕öα╕üα╕▓α╕úα╣üα╕Üα╕Öα╣Çα╕Öα╕¡α╕úα╣î
          </button>
          <button 
            className={`btn ${activeTab === 'samples' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('samples')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <ImageIcon size={18} /> α╕êα╕▒α╕öα╕üα╕▓α╕úα╕úα╕╣α╕¢α╕òα╕▒α╕ºα╕¡α╕óα╣êα╕▓α╕çα╕¬α╕┤α╕Öα╕äα╣ëα╕▓
          </button>
        </div>

        {activeTab === 'portfolio' && (
          <PortfolioManager 
            seriesList={seriesList} 
            modelsList={modelsList}
            portfolioList={portfolioList} 
            onRefresh={loadData} 
            onDelete={(id) => handleDelete('portfolio', id)} 
          />
        )}

        {activeTab === 'catalog' && (
          <CatalogManager 
            groupsList={groupsList}
            seriesList={seriesList} 
            modelsList={modelsList} 
            onRefresh={loadData} 
            onDelete={(endpoint, id) => handleDelete(endpoint, id)} 
          />
        )}

        {activeTab === 'downloads' && (
          <DownloadManager 
            seriesList={seriesList}
            downloadsList={downloadsList} 
            onRefresh={loadData} 
            onDelete={(id) => handleDelete('downloads', id)} 
          />
        )}

        {activeTab === 'banners' && (
          <BannerManager 
            bannersList={bannersList} 
            onRefresh={loadData} 
            onDelete={(endpoint, id) => handleDelete(endpoint, id)} 
          />
        )}
        
        {activeTab === 'samples' && (
          <SampleManager 
            seriesList={seriesList} 
            modelsList={modelsList}
            portfolioList={portfolioList} 
            onRefresh={loadData} 
            onDelete={(id) => handleDelete('portfolio', id)} 
          />
        )}
        
      </div>
    </div>
  );
}

// --- CATALOG MANAGER ---
function CatalogManager({ groupsList, seriesList, modelsList, onRefresh, onDelete }) {
  const [newSeries, setNewSeries] = useState({ title: '', desc: '', longDesc: '', groupId: 'g1' });
  const [newModel, setNewModel] = useState({ seriesId: '', name: '', shgc: '', vlt: '', vlr: '', uv: '', ir: '', tser: '', thickness: '' });
  
  const [editingSeriesId, setEditingSeriesId] = useState(null);
  const [editSeriesData, setEditSeriesData] = useState({ title: '', desc: '', longDesc: '', groupId: '' });

  const [editingModelId, setEditingModelId] = useState(null);
  const [editModelData, setEditModelData] = useState({ name: '', shgc: '', vlt: '', vlr: '', uv: '', ir: '', tser: '', thickness: '' });

  const [filterGroup, setFilterGroup] = useState('');
  const [searchSeries, setSearchSeries] = useState('');
  const [searchModel, setSearchModel] = useState('');

  const filteredSeriesList = seriesList.filter(s => {
    const matchGroup = filterGroup === '' || s.groupId === filterGroup;
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
      alert('α╣äα╕íα╣êα╕¬α╕▓α╕íα╕▓α╕úα╕ûα╕Üα╕▒α╕Öα╕ùα╕╢α╕üα╣äα╕öα╣ë');
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
      alert('α╣äα╕íα╣êα╕¬α╕▓α╕íα╕▓α╕úα╕ûα╕Üα╕▒α╕Öα╕ùα╕╢α╕üα╣äα╕öα╣ë');
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
          <h3 style={{ marginBottom: '1rem', color: 'var(--primary-blue)' }}>α╣Çα╕₧α╕┤α╣êα╕íα╕úα╕╕α╣êα╕Öα╕ƒα╕┤α╕Ñα╣îα╕í (Series)</h3>
          <form onSubmit={handleAddSeries} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '500' }}>α╕èα╕╖α╣êα╕¡ Series</label>
                <input type="text" value={newSeries.title} onChange={e => setNewSeries({...newSeries, title: e.target.value})} required className="form-control" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '500' }}>α╕üα╕Ñα╕╕α╣êα╕íα╕£α╕Ñα╕┤α╕òα╕áα╕▒α╕ôα╕æα╣î</label>
                <select value={newSeries.groupId} onChange={e => setNewSeries({...newSeries, groupId: e.target.value})} required className="form-control">
                  {groupsList?.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
                </select>
              </div>
              <div style={{ flex: 2 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '500' }}>α╕äα╕│α╕¡α╕ÿα╕┤α╕Üα╕▓α╕óα╕¬α╕▒α╣ëα╕Öα╣å</label>
                <input type="text" value={newSeries.desc} onChange={e => setNewSeries({...newSeries, desc: e.target.value})} required className="form-control" />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '500' }}>α╕äα╕│α╕¡α╕ÿα╕┤α╕Üα╕▓α╕óα╣üα╕Üα╕Üα╕óα╕▓α╕º (α╕úα╕¡α╕çα╕úα╕▒α╕Ü HTML)</label>
              <div style={{ backgroundColor: 'white', borderRadius: '4px', marginTop: '0.2rem' }}>
                <ReactQuill theme="snow" value={newSeries.longDesc || ''} onChange={(val) => setNewSeries({...newSeries, longDesc: val})} style={{ minHeight: '150px' }} placeholder="α╕¬α╕▓α╕íα╕▓α╕úα╕ûα╕₧α╕┤α╕íα╕₧α╣îα╕éα╣ëα╕¡α╕äα╕ºα╕▓α╕íα╕ÿα╕úα╕úα╕íα╕öα╕▓ α╕½α╕úα╕╖α╕¡α╕êα╕▒α╕öα╕úα╕╣α╕¢α╣üα╕Üα╕Üα╕òα╕▒α╕ºα╕½α╕Öα╕▓ α╕òα╕▒α╕ºα╣Çα╕¡α╕╡α╕óα╕ç α╕»α╕Ñα╕» α╣äα╕öα╣ëα╣Çα╕½α╕íα╕╖α╕¡α╕Ö Word" />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', minWidth: '120px' }}>+ α╣Çα╕₧α╕┤α╣êα╕í Series</button>
            </div>
          </form>
        </div>
        
        <div>
          <h3 style={{ marginBottom: '1rem', color: 'var(--primary-blue)' }}>α╕úα╕▓α╕óα╕üα╕▓α╕úα╕úα╕╕α╣êα╕Öα╕ƒα╕┤α╕Ñα╣îα╕í (Series)</h3>
        <hr style={{ margin: '2rem 0', border: 'none', borderTop: '1px solid #ddd' }} />
        
        <div style={{ backgroundColor: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', border: '1px solid #eee' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem', color: '#555' }}>≡ƒöì α╕äα╣ëα╕Öα╕½α╕▓α╕èα╕╖α╣êα╕¡α╕úα╕╕α╣êα╕Öα╕ƒα╕┤α╕Ñα╣îα╕í</label>
            <input type="text" className="form-control" placeholder="α╕₧α╕┤α╕íα╕₧α╣îα╕èα╕╖α╣êα╕¡α╕úα╕╕α╣êα╕Ö α╕½α╕úα╕╖α╕¡α╕äα╕│α╕¡α╕ÿα╕┤α╕Üα╕▓α╕ó..." value={searchSeries} onChange={e => setSearchSeries(e.target.value)} />
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem', color: '#555' }}>≡ƒôü α╕üα╕úα╕¡α╕çα╕òα╕▓α╕íα╕üα╕Ñα╕╕α╣êα╕íα╕£α╕Ñα╕┤α╕òα╕áα╕▒α╕ôα╕æα╣î</label>
            <select className="form-control" value={filterGroup} onChange={e => setFilterGroup(e.target.value)}>
              <option value="">-- α╣üα╕¬α╕öα╕çα╕ùα╕╕α╕üα╕üα╕Ñα╕╕α╣êα╕íα╕£α╕Ñα╕┤α╕òα╕áα╕▒α╕ôα╕æα╣î --</option>
              {groupsList?.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
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
                    <input type="text" value={editSeriesData.title} onChange={e => setEditSeriesData({...editSeriesData, title: e.target.value})} className="form-control" placeholder="α╕èα╕╖α╣êα╕¡ Series" />
                    <input type="text" value={editSeriesData.desc} onChange={e => setEditSeriesData({...editSeriesData, desc: e.target.value})} className="form-control" placeholder="α╕äα╕│α╕¡α╕ÿα╕┤α╕Üα╕▓α╕óα╕¬α╕▒α╣ëα╕Öα╣å" />
                    <select value={editSeriesData.groupId} onChange={e => setEditSeriesData({...editSeriesData, groupId: e.target.value})} className="form-control" style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                      {groupsList?.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
                    </select>
                    <div style={{ backgroundColor: 'white' }}>
                      <ReactQuill theme="snow" value={editSeriesData.longDesc || ''} onChange={(val) => setEditSeriesData({...editSeriesData, longDesc: val})} style={{ minHeight: '200px' }} placeholder="α╕äα╕│α╕¡α╕ÿα╕┤α╕Üα╕▓α╕óα╣üα╕Üα╕Üα╕óα╕▓α╕º" />
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
                      <button onClick={handleSaveEditSeries} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem' }}>α╕Üα╕▒α╕Öα╕ùα╕╢α╕ü</button>
                      <button onClick={() => setEditingSeriesId(null)} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem' }}>α╕óα╕üα╣Çα╕Ñα╕┤α╕ü</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEditClick(series)} className="btn btn-outline" style={{ borderColor: 'var(--primary-blue)', color: 'var(--primary-blue)', padding: '0.4rem 0.8rem' }}>α╣üα╕üα╣ëα╣äα╕é</button>
                      <button onClick={() => onDelete('series', series.id)} className="btn btn-outline" style={{ borderColor: 'red', color: 'red', padding: '0.4rem 0.8rem' }}>α╕Ñα╕Ü</button>
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
          <h3 style={{ marginBottom: '1rem', color: 'var(--primary-blue)' }}>α╣Çα╕₧α╕┤α╣êα╕íα╕¬α╣Çα╕¢α╕äα╣éα╕íα╣Çα╕öα╕Ñ</h3>
          <form onSubmit={handleAddModel} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#333', marginBottom: '0.4rem', display: 'block' }}>α╣Çα╕₧α╕┤α╣êα╕íα╣âα╕Ö Series</label>
              <select value={newModel.seriesId} onChange={e => setNewModel({...newModel, seriesId: e.target.value})} className="form-control" style={{ width: '100%' }}>
                {seriesList.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#333', marginBottom: '0.4rem', display: 'block' }}>α╕èα╕╖α╣êα╕¡α╕úα╕╕α╣êα╕Ö (Model)</label>
              <input type="text" value={newModel.name} onChange={e => setNewModel({...newModel, name: e.target.value})} required className="form-control" placeholder="α╣Çα╕èα╣êα╕Ö PR 70 EX" style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#555', marginBottom: '0.4rem', display: 'block' }}>α╕äα╣êα╕▓ SHGC</label>
              <input type="text" value={newModel.shgc} onChange={e => setNewModel({...newModel, shgc: e.target.value})} className="form-control" placeholder="0.38" style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#555', marginBottom: '0.4rem', display: 'block' }}>α╣üα╕¬α╕çα╕£α╣êα╕▓α╕Ö (VLT)</label>
              <input type="text" value={newModel.vlt} onChange={e => setNewModel({...newModel, vlt: e.target.value})} className="form-control" placeholder="6%" style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#555', marginBottom: '0.4rem', display: 'block' }}>α╕¬α╕░α╕ùα╣ëα╕¡α╕Ö (VLR)</label>
              <input type="text" value={newModel.vlr} onChange={e => setNewModel({...newModel, vlr: e.target.value})} className="form-control" placeholder="8%" style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#555', marginBottom: '0.4rem', display: 'block' }}>α╕üα╕▒α╕Ö UV</label>
              <input type="text" value={newModel.uv} onChange={e => setNewModel({...newModel, uv: e.target.value})} className="form-control" placeholder="99%" style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#555', marginBottom: '0.4rem', display: 'block' }}>α╕üα╕▒α╕Öα╕úα╣ëα╕¡α╕Ö (IR)</label>
              <input type="text" value={newModel.ir} onChange={e => setNewModel({...newModel, ir: e.target.value})} className="form-control" placeholder="97%" style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#555', marginBottom: '0.4rem', display: 'block' }}>α╕Ñα╕öα╕úα╣ëα╕¡α╕Ö (TSER)</label>
              <input type="text" value={newModel.tser} onChange={e => setNewModel({...newModel, tser: e.target.value})} className="form-control" placeholder="60%" style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#555', marginBottom: '0.4rem', display: 'block' }}>α╕äα╕ºα╕▓α╕íα╕½α╕Öα╕▓</label>
              <input type="text" value={newModel.thickness} onChange={e => setNewModel({...newModel, thickness: e.target.value})} className="form-control" placeholder="2 mil" style={{ width: '100%' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.7rem', fontWeight: 'bold', borderRadius: '8px' }}>+ α╣Çα╕₧α╕┤α╣êα╕íα╣éα╕íα╣Çα╕öα╕Ñ</button>
            </div>
          </form>
        </div>
        
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: 'var(--primary-blue)' }}>α╕úα╕▓α╕óα╕üα╕▓α╕úα╕¬α╣Çα╕¢α╕äα╣éα╕íα╣Çα╕öα╕Ñα╕óα╣êα╕¡α╕ó (Models)</h3>
          </div>
          <div style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #eee' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem', color: '#555' }}>≡ƒöì α╕äα╣ëα╕Öα╕½α╕▓α╕èα╕╖α╣êα╕¡α╕úα╕╕α╣êα╕Ö (Model)</label>
            <input type="text" className="form-control" placeholder="α╕₧α╕┤α╕íα╕₧α╣îα╕èα╕╖α╣êα╕¡α╕úα╕╕α╣êα╕Ö α╣Çα╕èα╣êα╕Ö PR 70 EX..." value={searchModel} onChange={e => setSearchModel(e.target.value)} />
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
                      <th style={{ padding: '0.5rem' }}>α╕úα╕╕α╣êα╕Ö</th>
                      <th style={{ padding: '0.5rem' }}>SHGC</th>
                      <th style={{ padding: '0.5rem' }}>VLT</th>
                      <th style={{ padding: '0.5rem' }}>VLR</th>
                      <th style={{ padding: '0.5rem' }}>UV</th>
                      <th style={{ padding: '0.5rem' }}>IR</th>
                      <th style={{ padding: '0.5rem' }}>TSER</th>
                      <th style={{ padding: '0.5rem' }}>α╕½α╕Öα╕▓</th>
                      <th style={{ padding: '0.5rem' }}>α╕êα╕▒α╕öα╕üα╕▓α╕ú</th>
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
                                <button onClick={handleSaveEditModel} style={{ color: 'var(--primary-blue)', border: 'none', background: 'none', cursor: 'pointer' }}>α╕Üα╕▒α╕Öα╕ùα╕╢α╕ü</button>
                                <button onClick={() => setEditingModelId(null)} style={{ color: 'var(--text-muted)', border: 'none', background: 'none', cursor: 'pointer' }}>α╕óα╕üα╣Çα╕Ñα╕┤α╕ü</button>
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
                                <button onClick={() => handleEditModelClick(m)} style={{ color: 'var(--primary-blue)', border: 'none', background: 'none', cursor: 'pointer' }}>α╣üα╕üα╣ëα╣äα╕é</button>
                                <button onClick={() => onDelete('models', m.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>α╕Ñα╕Ü</button>
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
function DownloadManager({ seriesList, downloadsList, onRefresh, onDelete }) {
  const [formData, setFormData] = useState({
    title: '', category: 'catalog', seriesId: ''
  });
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  
  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'catalog': return 'α╣üα╕äα╕òα╕òα╕▓α╕Ñα╣çα╕¡α╕ü';
      case 'spec': return 'Data Sheet';
      case 'test_report': return 'Test Report';
      case 'other': return 'α╕¡α╕╖α╣êα╕Öα╣å';
      default: return 'α╣Çα╕¡α╕üα╕¬α╕▓α╕ú';
    }
  };
  
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ title: '', seriesId: '', category: 'catalog' });
  
  const [filterTitle, setFilterTitle] = useState('');
  const [filterSeries, setFilterSeries] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const handleEditSave = async (id) => {
    try {
      const res = await fetch(`https://nas.goodfilmshop.com/downloads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editData.title, seriesId: editData.seriesId, category: editData.category })
      });
      if (res.ok) {
        setEditingId(null);
        onRefresh();
      } else {
        alert('α╣üα╕üα╣ëα╣äα╕éα╣äα╕íα╣êα╕¬α╕│α╣Çα╕úα╣çα╕ê');
      }
    } catch (err) {
      console.error(err);
      alert('α╣Çα╕üα╕┤α╕öα╕éα╣ëα╕¡α╕£α╕┤α╕öα╕₧α╕Ñα╕▓α╕ö');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setStatus('Γ¥î α╕üα╕úα╕╕α╕ôα╕▓α╣Çα╕Ñα╕╖α╕¡α╕üα╣äα╕ƒα╕Ñα╣î');
      return;
    }
    setStatus('α╕üα╕│α╕Ñα╕▒α╕çα╕¡α╕▒α╕¢α╣éα╕½α╕Ñα╕ö...');
    try {
      const data = new FormData();
      data.append('category', formData.category);
      data.append('file', file);
      
      const uploadRes = await fetch(`https://nas.goodfilmshop.com/upload-download`, {
        method: 'POST', body: data
      });
      
      if (!uploadRes.ok) throw new Error('Upload failed');
      const uploadData = await uploadRes.json();
      
      const ext = file.name.split('.').pop().toUpperCase();
      const fileSize = (file.size / (1024 * 1024)).toFixed(1) + ' MB';

      const res = await fetch(`https://nas.goodfilmshop.com/downloads`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: Date.now().toString(),
          seriesId: formData.seriesId || '',
          title: formData.title,
          category: formData.category,
          ext: ext,
          info: `${ext}  ${fileSize}`,
          file: uploadData.url
        })
      });
      
      if (res.ok) {
        setStatus('Γ£à α╕Üα╕▒α╕Öα╕ùα╕╢α╕üα╕¬α╕│α╣Çα╕úα╣çα╕ê!');
        setFormData({ title: '', category: 'catalog', seriesId: '' });
        setFile(null);
        e.target.reset();
        onRefresh();
        setTimeout(() => setStatus(''), 3000);
      } else {
        setStatus('Γ¥î α╕Üα╕▒α╕Öα╕ùα╕╢α╕üα╣äα╕íα╣êα╕¬α╕│α╣Çα╕úα╣çα╕ê');
      }
    } catch (err) {
      console.error(err);
      setStatus('Γ¥î α╣Çα╕üα╕┤α╕öα╕éα╣ëα╕¡α╕£α╕┤α╕öα╕₧α╕Ñα╕▓α╕ö');
    }
  };

  const filteredDownloads = downloadsList.filter(item => {
    const matchTitle = filterTitle === '' || item.title.toLowerCase().includes(filterTitle.toLowerCase());
    const matchSeries = filterSeries === '' || item.seriesId === filterSeries;
    const matchCategory = filterCategory === '' || item.category === filterCategory;
    return matchTitle && matchSeries && matchCategory;
  });

  return (
    <div className="admin-grid">
      <div className="card" style={{ padding: '1.5rem', alignSelf: 'start' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary-blue)' }}>α╕¡α╕▒α╕¢α╣éα╕½α╕Ñα╕öα╣äα╕ƒα╕Ñα╣îα╣âα╕½α╕íα╣ê</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>α╕èα╕╖α╣êα╕¡α╣Çα╕¡α╕üα╕¬α╕▓α╕ú / α╣üα╕äα╕òα╕òα╕▓α╕Ñα╣çα╕¡α╕ü</label>
            <input type="text" className="form-control" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required placeholder="α╣Çα╕èα╣êα╕Ö α╣üα╕äα╕òα╕òα╕▓α╕Ñα╣çα╕¡α╕ü 3M α╕ƒα╕┤α╕Ñα╣îα╕íα╕Öα╕┤α╕úα╕áα╕▒α╕ó" />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>α╕½α╕íα╕ºα╕öα╕½α╕íα╕╣α╣ê</label>
            <select className="form-control" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
              <option value="catalog">α╣üα╕äα╕òα╕òα╕▓α╕Ñα╣çα╕¡α╕ü</option>
              <option value="spec">Data Sheet</option>
              <option value="test_report">Test Report</option>
              <option value="other">α╕¡α╕╖α╣êα╕Öα╣å</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>α╕Öα╕│α╣äα╕¢α╣üα╕¬α╕öα╕çα╣âα╕Öα╕úα╕╕α╣êα╕Öα╕ƒα╕┤α╕Ñα╣îα╕í (α╕òα╕▒α╕ºα╣Çα╕Ñα╕╖α╕¡α╕üα╣Çα╕¬α╕úα╕┤α╕í)</label>
            <select className="form-control" value={formData.seriesId} onChange={e => setFormData({...formData, seriesId: e.target.value})}>
              <option value="">-- α╣äα╕íα╣êα╕úα╕░α╕Üα╕╕ (α╣üα╕¬α╕öα╕çα╕ùα╕╕α╕üα╕úα╕╕α╣êα╕Ö α╕½α╕úα╕╖α╕¡ α╕òα╕▓α╕íα╕èα╕╖α╣êα╕¡α╣äα╕ƒα╕Ñα╣î) --</option>
              {seriesList?.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>α╣äα╕ƒα╕Ñα╣îα╣Çα╕¡α╕üα╕¬α╕▓α╕ú (PDF, JPG, PNG)</label>
            <input type="file" className="form-control" onChange={e => setFile(e.target.files[0])} required accept=".pdf,image/png,image/jpeg" />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>α╕¡α╕▒α╕¢α╣éα╕½α╕Ñα╕öα╣üα╕Ñα╕░α╕Üα╕▒α╕Öα╕ùα╕╢α╕ü</button>
          {status && <div style={{ marginTop: '1rem', color: status.includes('Γ¥î') ? 'red' : 'green', fontWeight: 'bold' }}>{status}</div>}
        </form>
      </div>

      <div className="card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary-blue)' }}>α╕úα╕▓α╕óα╕üα╕▓α╕úα╣äα╕ƒα╕Ñα╣îα╕ùα╕▒α╣ëα╕çα╕½α╕íα╕ö</h3>
        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem', fontWeight: 'bold' }}>α╕èα╕╖α╣êα╕¡α╣Çα╕¡α╕üα╕¬α╕▓α╕ú</label>
            <input type="text" className="form-control" placeholder="α╕äα╣ëα╕Öα╕½α╕▓α╕èα╕╖α╣êα╕¡α╣Çα╕¡α╕üα╕¬α╕▓α╕ú..." value={filterTitle} onChange={e => setFilterTitle(e.target.value)} />
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem', fontWeight: 'bold' }}>α╣üα╕¬α╕öα╕çα╣âα╕Öα╕úα╕╕α╣êα╕Öα╕ƒα╕┤α╕Ñα╣îα╕í</label>
            <select className="form-control" value={filterSeries} onChange={e => setFilterSeries(e.target.value)}>
              <option value="">-- α╕ùα╕▒α╣ëα╕çα╕½α╕íα╕ö --</option>
              {seriesList?.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem', fontWeight: 'bold' }}>α╕½α╕íα╕ºα╕öα╕½α╕íα╕╣α╣ê</label>
            <select className="form-control" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
              <option value="">-- α╕ùα╕▒α╣ëα╕çα╕½α╕íα╕ö --</option>
              <option value="catalog">α╣üα╕äα╕òα╕òα╕▓α╕Ñα╣çα╕¡α╕ü</option>
              <option value="spec">Data Sheet</option>
              <option value="test_report">Test Report</option>
              <option value="other">α╕¡α╕╖α╣êα╕Öα╣å</option>
            </select>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
              <th style={{ padding: '0.5rem' }}>α╣äα╕ƒα╕Ñα╣î</th>
              <th style={{ padding: '0.5rem' }}>α╕èα╕╖α╣êα╕¡α╣Çα╕¡α╕üα╕¬α╕▓α╕ú</th>
              <th style={{ padding: '0.5rem' }}>α╣üα╕¬α╕öα╕çα╣âα╕Öα╕úα╕╕α╣êα╕Öα╕ƒα╕┤α╕Ñα╣îα╕í</th>
              <th style={{ padding: '0.5rem' }}>α╕½α╕íα╕ºα╕öα╕½α╕íα╕╣α╣ê</th>
              <th style={{ padding: '0.5rem', textAlign: 'right' }}>α╕êα╕▒α╕öα╕üα╕▓α╕ú</th>
            </tr>
          </thead>
          <tbody>
            {filteredDownloads.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.5rem' }}>
                  <a href={getFullUrl(item.file)} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-blue)', fontWeight: 'bold' }}>{item.ext}</a>
                </td>
                <td style={{ padding: '0.5rem', whiteSpace: 'pre-line' }}>
                  {editingId === item.id ? (
                    <input 
                      type="text" 
                      className="form-control" 
                      value={editData.title} 
                      onChange={e => setEditData({...editData, title: e.target.value})} 
                      style={{ padding: '0.3rem', width: '100%' }}
                      autoFocus
                    />
                  ) : (
                    item.title
                  )}
                </td>
                <td style={{ padding: '0.5rem' }}>
                  {editingId === item.id ? (
                    <select className="form-control" value={editData.seriesId} onChange={e => setEditData({...editData, seriesId: e.target.value})} style={{ padding: '0.3rem', width: '150px' }}>
                      <option value="">- α╣äα╕íα╣êα╕úα╕░α╕Üα╕╕ -</option>
                      {seriesList?.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                    </select>
                  ) : (
                    item.seriesId ? seriesList?.find(s => s.id === item.seriesId)?.title || '-' : '-'
                  )}
                </td>
                <td style={{ padding: '0.5rem' }}>
                  {editingId === item.id ? (
                    <select className="form-control" value={editData.category} onChange={e => setEditData({...editData, category: e.target.value})} style={{ padding: '0.3rem', width: '120px' }}>
                      <option value="catalog">α╣üα╕äα╕òα╕òα╕▓α╕Ñα╣çα╕¡α╕ü</option>
                      <option value="spec">Data Sheet</option>
                      <option value="test_report">Test Report</option>
                      <option value="other">α╕¡α╕╖α╣êα╕Öα╣å</option>
                    </select>
                  ) : (
                    getCategoryLabel(item.category)
                  )}
                </td>
                <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                  {editingId === item.id ? (
                    <>
                      <button onClick={() => handleEditSave(item.id)} style={{ color: 'green', border: 'none', background: 'none', cursor: 'pointer', marginRight: '0.5rem' }} title="α╕Üα╕▒α╕Öα╕ùα╕╢α╕ü"><Check size={18}/></button>
                      <button onClick={() => setEditingId(null)} style={{ color: '#666', border: 'none', background: 'none', cursor: 'pointer' }} title="α╕óα╕üα╣Çα╕Ñα╕┤α╕ü"><X size={18}/></button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditingId(item.id); setEditData({ title: item.title, seriesId: item.seriesId || '', category: item.category || 'catalog' }); }} style={{ color: 'var(--primary-blue)', border: 'none', background: 'none', cursor: 'pointer', marginRight: '0.5rem' }} title="α╣üα╕üα╣ëα╣äα╕é"><Edit2 size={18}/></button>
                      <button onClick={() => onDelete(item.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }} title="α╕Ñα╕Ü"><Trash2 size={18}/></button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {downloadsList.length === 0 && <tr><td colSpan="5" style={{ padding: '1rem', textAlign: 'center' }}>α╣äα╕íα╣êα╕íα╕╡α╕éα╣ëα╕¡α╕íα╕╣α╕Ñ</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- BANNER MANAGER ---
function BannerManager({ bannersList, onRefresh, onDelete }) {
  const [formData, setFormData] = useState({ linkUrl: '' });
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setStatus('Γ¥î α╕üα╕úα╕╕α╕ôα╕▓α╣Çα╕Ñα╕╖α╕¡α╕üα╣äα╕ƒα╕Ñα╣îα╕úα╕╣α╕¢α╕áα╕▓α╕₧');
      return;
    }
    setStatus('α╕üα╕│α╕Ñα╕▒α╕çα╕¡α╕▒α╕¢α╣éα╕½α╕Ñα╕ö...');
    try {
      const data = new FormData();
      data.append('file', file);
      
      const uploadRes = await fetch(`https://nas.goodfilmshop.com/upload-banner`, {
        method: 'POST', body: data
      });
      if (!uploadRes.ok) throw new Error('Upload failed');
      const uploadData = await uploadRes.json();

      const res = await fetch(`https://nas.goodfilmshop.com/banners`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: Date.now().toString(),
          imageUrl: uploadData.url,
          linkUrl: formData.linkUrl
        })
      });
      
      if (res.ok) {
        setStatus('Γ£à α╕Üα╕▒α╕Öα╕ùα╕╢α╕üα╣üα╕Üα╕Öα╣Çα╕Öα╕¡α╕úα╣îα╕¬α╕│α╣Çα╕úα╣çα╕ê!');
        setFormData({ linkUrl: '' });
        setFile(null);
        e.target.reset();
        onRefresh();
        setTimeout(() => setStatus(''), 3000);
      } else {
        setStatus('Γ¥î α╕Üα╕▒α╕Öα╕ùα╕╢α╕üα╣äα╕íα╣êα╕¬α╕│α╣Çα╕úα╣çα╕ê');
      }
    } catch (err) {
      setStatus('Γ¥î α╣Çα╕üα╕┤α╕öα╕éα╣ëα╕¡α╕£α╕┤α╕öα╕₧α╕Ñα╕▓α╕öα╣âα╕Öα╕üα╕▓α╕úα╕¡α╕▒α╕¢α╣éα╕½α╕Ñα╕ö');
    }
  };

  return (
    <div className="admin-grid">
      <div className="premium-card" style={{ padding: '1.5rem', alignSelf: 'start' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary-blue)' }}>α╣Çα╕₧α╕┤α╣êα╕íα╣üα╕Üα╕Öα╣Çα╕Öα╕¡α╕úα╣îα╣âα╕½α╕íα╣ê</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>α╣äα╕ƒα╕Ñα╣îα╕úα╕╣α╕¢α╕áα╕▓α╕₧ (α╣üα╕Öα╕░α╕Öα╕│α╕¬α╕▒α╕öα╕¬α╣êα╕ºα╕Öα╣üα╕Öα╕ºα╕Öα╕¡α╕Ö)</label>
            <input type="file" className="form-control" onChange={e => setFile(e.target.files[0])} required accept="image/*" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>α╕Ñα╕┤α╕çα╕üα╣îα╣Çα╕íα╕╖α╣êα╕¡α╕üα╕öα╣üα╕Üα╕Öα╣Çα╕Öα╕¡α╕úα╣î (α╣äα╕íα╣êα╕Üα╕▒α╕çα╕äα╕▒α╕Ü)</label>
            <input type="text" className="form-control" value={formData.linkUrl} onChange={e => setFormData({...formData, linkUrl: e.target.value})} placeholder="α╣Çα╕èα╣êα╕Ö https://... α╕½α╕úα╕╖α╕¡ /?series=..." />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>α╕¡α╕▒α╕¢α╣éα╕½α╕Ñα╕öα╣üα╕Üα╕Öα╣Çα╕Öα╕¡α╕úα╣î</button>
          {status && <div style={{ marginTop: '1rem', color: status.includes('Γ¥î') ? 'red' : 'green', fontWeight: 'bold' }}>{status}</div>}
        </form>
      </div>

      <div>
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary-blue)' }}>α╕úα╕▓α╕óα╕üα╕▓α╕úα╣üα╕Üα╕Öα╣Çα╕Öα╕¡α╕úα╣îα╕ùα╕▒α╣ëα╕çα╕½α╕íα╕ö</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {bannersList.map(item => (
            <div key={item.id} className="premium-card" style={{ padding: '1rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <img src={getFullUrl(item.imageUrl)} alt="Banner" style={{ width: '150px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--text-main)' }}>α╕Ñα╕┤α╕çα╕üα╣î: {item.linkUrl || 'α╣äα╕íα╣êα╕íα╕╡α╕Ñα╕┤α╕çα╕üα╣î'}</p>
              </div>
              <button onClick={() => onDelete('banners', item.id)} className="btn btn-outline" style={{ borderColor: 'red', color: 'red', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Trash2 size={16} /> α╕Ñα╕Ü
              </button>
            </div>
          ))}
          {bannersList.length === 0 && <p style={{ color: 'var(--text-muted)' }}>α╕óα╕▒α╕çα╣äα╕íα╣êα╕íα╕╡α╣üα╕Üα╕Öα╣Çα╕Öα╕¡α╕úα╣î</p>}
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
// --- SAMPLE MANAGER ---
function SampleManager({ seriesList, modelsList, portfolioList, onRefresh, onDelete }) {
  const [formData, setFormData] = useState({
    title: '', seriesId: '', modelId: '', 
    image1: '', image2: '', image3: '', image4: '',
    existingImage1: '', existingImage2: '', existingImage3: '', existingImage4: '',
    label1: 'α╕áα╕▓α╕₧α╕êα╕│α╕Ñα╕¡α╕çα╕äα╕ºα╕▓α╕íα╣Çα╕éα╣ëα╕í α╕íα╕¡α╕çα╕êα╕▓α╕üα╕áα╕▓α╕óα╕Öα╕¡α╕üα╕¡α╕▓α╕äα╕▓α╕ú', label2: 'α╕áα╕▓α╕₧α╕êα╕│α╕Ñα╕¡α╕çα╕äα╕ºα╕▓α╕íα╣Çα╕éα╣ëα╕í α╕íα╕¡α╕çα╕êα╕▓α╕üα╕áα╕▓α╕óα╣âα╕Öα╕¡α╕▓α╕äα╕▓α╕ú'
  });
  const [status, setStatus] = useState('');
  const [editId, setEditId] = useState(null);

  const sampleList = portfolioList.filter(p => p.type === 'sample');

  useEffect(() => {
    if (seriesList.length > 0 && !formData.seriesId) {
      setFormData(prev => ({ ...prev, seriesId: seriesList[0].id }));
    }
  }, [seriesList]);

  useEffect(() => {
    if (formData.seriesId) {
      const seriesModels = modelsList.filter(m => m.seriesId === formData.seriesId);
      if (seriesModels.length > 0 && (!formData.modelId || !seriesModels.find(m => m.id === formData.modelId))) {
        setFormData(prev => ({ ...prev, modelId: seriesModels[0].id }));
      } else if (seriesModels.length === 0) {
        setFormData(prev => ({ ...prev, modelId: '' }));
      }
    }
  }, [formData.seriesId, modelsList]);

  const handleImageUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 1200;
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          setFormData(prev => ({ ...prev, [fieldName]: blob }));
        }, 'image/jpeg', 0.7);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const uploadFile = async (blob, prefix) => {
    if (!blob) return '';
    const data = new FormData();
    data.append('category', 'portfolio');
    data.append('file', new File([blob], prefix + '-' + Date.now() + '.jpg', { type: 'image/jpeg' }));
    const res = await fetch('https://nas.goodfilmshop.com/upload-download', { method: 'POST', body: data });
    if (!res.ok) throw new Error('Upload failed');
    const json = await res.json();
    return json.url || json.file;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('ΓÅ│ α╕üα╕│α╕Ñα╕▒α╕çα╕Üα╕▒α╕Öα╕ùα╕╢α╕üα╕éα╣ëα╕¡α╕íα╕╣α╕Ñ...');
    try {
      const payloadId = editId || Date.now().toString();
      
      const [i1, i2, i3, i4] = await Promise.all([
        formData.image1 ? uploadFile(formData.image1, 'sample-1') : Promise.resolve(formData.existingImage1 || ''),
        formData.image2 ? uploadFile(formData.image2, 'sample-2') : Promise.resolve(formData.existingImage2 || ''),
        formData.image3 ? uploadFile(formData.image3, 'sample-3') : Promise.resolve(formData.existingImage3 || ''),
        formData.image4 ? uploadFile(formData.image4, 'sample-4') : Promise.resolve(formData.existingImage4 || '')
      ]);

      const method = editId ? 'PUT' : 'POST';
      const url = editId ? `https://nas.goodfilmshop.com/portfolio/${editId}` : 'https://nas.goodfilmshop.com/portfolio';

      const res = await fetch(url, {
        method: method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: payloadId, 
          type: 'sample',
          seriesId: formData.seriesId, 
          modelId: formData.modelId, 
          title: formData.title,
          label1: formData.label1,
          label2: formData.label2,
          image1: i1, image2: i2, image3: i3, image4: i4
        })
      });
      if (res.ok) {
        setStatus('Γ£à α╕Üα╕▒α╕Öα╕ùα╕╢α╕üα╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╕¬α╕│α╣Çα╕úα╣çα╕ê!');
        setFormData({ title: '', seriesId: formData.seriesId, modelId: '', image1: '', image2: '', image3: '', image4: '', existingImage1: '', existingImage2: '', existingImage3: '', existingImage4: '', label1: 'α╕áα╕▓α╕₧α╕êα╕│α╕Ñα╕¡α╕çα╕äα╕ºα╕▓α╕íα╣Çα╕éα╣ëα╕í α╕íα╕¡α╕çα╕êα╕▓α╕üα╕áα╕▓α╕óα╕Öα╕¡α╕üα╕¡α╕▓α╕äα╕▓α╕ú', label2: 'α╕áα╕▓α╕₧α╕êα╕│α╕Ñα╕¡α╕çα╕äα╕ºα╕▓α╕íα╣Çα╕éα╣ëα╕í α╕íα╕¡α╕çα╕êα╕▓α╕üα╕áα╕▓α╕óα╣âα╕Öα╕¡α╕▓α╕äα╕▓α╕ú' });
        setEditId(null);
        e.target.reset();
        onRefresh();
        setTimeout(() => setStatus(''), 3000);
      } else {
        setStatus('Γ¥î α╣Çα╕üα╕┤α╕öα╕éα╣ëα╕¡α╕£α╕┤α╕öα╕₧α╕Ñα╕▓α╕öα╣âα╕Öα╕üα╕▓α╕úα╕Üα╕▒α╕Öα╕ùα╕╢α╕üα╕éα╣ëα╕¡α╕íα╕╣α╕Ñ');
      }
    } catch (err) {
      console.error(err);
      setStatus('Γ¥î α╣Çα╕üα╕┤α╕öα╕éα╣ëα╕¡α╕£α╕┤α╕öα╕₧α╕Ñα╕▓α╕öα╣âα╕Öα╕üα╕▓α╕úα╣Çα╕èα╕╖α╣êα╕¡α╕íα╕òα╣êα╕¡α╣Çα╕ïα╕┤α╕úα╣îα╕ƒα╣Çα╕ºα╕¡α╕úα╣î');
    }
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setFormData({
      title: item.title || '',
      seriesId: item.seriesId || '',
      modelId: item.modelId || '',
      image1: null, image2: null, image3: null, image4: null,
      existingImage1: item.image1 || '',
      existingImage2: item.image2 || '',
      existingImage3: item.image3 || '',
      existingImage4: item.image4 || '',
      label1: item.label1 || 'α╕áα╕▓α╕₧α╕êα╕│α╕Ñα╕¡α╕çα╕äα╕ºα╕▓α╕íα╣Çα╕éα╣ëα╕í α╕íα╕¡α╕çα╕êα╕▓α╕üα╕áα╕▓α╕óα╕Öα╕¡α╕üα╕¡α╕▓α╕äα╕▓α╕ú',
      label2: item.label2 || 'α╕áα╕▓α╕₧α╕êα╕│α╕Ñα╕¡α╕çα╕äα╕ºα╕▓α╕íα╣Çα╕éα╣ëα╕í α╕íα╕¡α╕çα╕êα╕▓α╕üα╕áα╕▓α╕óα╣âα╕Öα╕¡α╕▓α╕äα╕▓α╕ú'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setFormData({ title: '', seriesId: formData.seriesId, modelId: '', image1: '', image2: '', image3: '', image4: '', existingImage1: '', existingImage2: '', existingImage3: '', existingImage4: '', label1: 'α╕áα╕▓α╕₧α╕êα╕│α╕Ñα╕¡α╕çα╕äα╕ºα╕▓α╕íα╣Çα╕éα╣ëα╕í α╕íα╕¡α╕çα╕êα╕▓α╕üα╕áα╕▓α╕óα╕Öα╕¡α╕üα╕¡α╕▓α╕äα╕▓α╕ú', label2: 'α╕áα╕▓α╕₧α╕êα╕│α╕Ñα╕¡α╕çα╕äα╕ºα╕▓α╕íα╣Çα╕éα╣ëα╕í α╕íα╕¡α╕çα╕êα╕▓α╕üα╕áα╕▓α╕óα╣âα╕Öα╕¡α╕▓α╕äα╕▓α╕ú' });
  };

  return (
    <div className="admin-card">
      <h2 style={{ color: 'var(--primary-blue)', marginBottom: '1.5rem' }}>α╕êα╕▒α╕öα╕üα╕▓α╕úα╕úα╕╣α╕¢α╕òα╕▒α╕ºα╕¡α╕óα╣êα╕▓α╕çα╕¬α╕┤α╕Öα╕äα╣ëα╕▓</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>α╕ïα╕╡α╕úα╕╡α╕¬α╣îα╕ƒα╕┤α╕Ñα╣îα╕í</label>
            <select className="form-control" value={formData.seriesId} onChange={e => setFormData({...formData, seriesId: e.target.value})} required>
              {seriesList.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
          </div>
          <div style={{ flex: '1 1 300px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>α╕úα╕╕α╣êα╕Öα╕óα╣êα╕¡α╕ó (α╣äα╕íα╣êα╕úα╕░α╕Üα╕╕α╕üα╣çα╣äα╕öα╣ë)</label>
            <select className="form-control" value={formData.modelId} onChange={e => setFormData({...formData, modelId: e.target.value})}>
              <option value="">-- α╣äα╕íα╣êα╕úα╕░α╕Üα╕╕ --</option>
              {modelsList.filter(m => m.seriesId === formData.seriesId).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>α╕½α╕▒α╕ºα╕éα╣ëα╕¡ / α╕äα╕│α╕Üα╕úα╕úα╕óα╕▓α╕óα╕¬α╕▒α╣ëα╕Öα╣å</label>
          <input type="text" className="form-control" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="α╣Çα╕èα╣êα╕Ö α╕úα╕╣α╕¢α╕òα╕▒α╕ºα╕¡α╕óα╣êα╕▓α╕çα╕òα╕┤α╕öα╕òα╕▒α╣ëα╕çα╕ƒα╕┤α╕Ñα╣îα╕íα╕úα╕╕α╣êα╕Ö..." required />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
          <div style={{ padding: '1rem', border: '1px dashed #ccc', borderRadius: '8px', backgroundColor: 'white' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>α╕äα╕│α╕Üα╕úα╕úα╕óα╕▓α╕óα╕úα╕╣α╕¢α╣üα╕úα╕ü</label>
            <input type="text" className="form-control" value={formData.label1} onChange={e => setFormData({...formData, label1: e.target.value})} style={{ marginBottom: '1rem' }} />
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>α╣äα╕ƒα╕Ñα╣îα╕úα╕╣α╕¢α╣üα╕úα╕ü</label>
            {formData.existingImage1 && !formData.image1 && <div style={{ marginBottom: '0.5rem', fontSize: '0.85rem', color: '#0056b3' }}>Γ£à α╕íα╕╡α╕úα╕╣α╕¢α╣Çα╕öα╕┤α╕íα╣üα╕Ñα╣ëα╕º (α╕¡α╕▒α╕₧α╣éα╕½α╕Ñα╕öα╣Çα╕₧α╕╖α╣êα╕¡α╣Çα╕¢α╕Ñα╕╡α╣êα╕óα╕Ö)</div>}
            <input type="file" className="form-control" onChange={e => handleImageUpload(e, 'image1')} accept="image/*" />
            {formData.image1 && <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'green' }}>Γ£à α╣Çα╕Ñα╕╖α╕¡α╕üα╕úα╕╣α╕¢α╣âα╕½α╕íα╣êα╣üα╕Ñα╣ëα╕º</div>}
          </div>
          <div style={{ padding: '1rem', border: '1px dashed #ccc', borderRadius: '8px', backgroundColor: 'white' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>α╕äα╕│α╕Üα╕úα╕úα╕óα╕▓α╕óα╕úα╕╣α╕¢α╕ùα╕╡α╣êα╕¬α╕¡α╕ç</label>
            <input type="text" className="form-control" value={formData.label2} onChange={e => setFormData({...formData, label2: e.target.value})} style={{ marginBottom: '1rem' }} />
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>α╣äα╕ƒα╕Ñα╣îα╕úα╕╣α╕¢α╕ùα╕╡α╣êα╕¬α╕¡α╕ç</label>
            {formData.existingImage2 && !formData.image2 && <div style={{ marginBottom: '0.5rem', fontSize: '0.85rem', color: '#0056b3' }}>Γ£à α╕íα╕╡α╕úα╕╣α╕¢α╣Çα╕öα╕┤α╕íα╣üα╕Ñα╣ëα╕º (α╕¡α╕▒α╕₧α╣éα╕½α╕Ñα╕öα╣Çα╕₧α╕╖α╣êα╕¡α╣Çα╕¢α╕Ñα╕╡α╣êα╕óα╕Ö)</div>}
            <input type="file" className="form-control" onChange={e => handleImageUpload(e, 'image2')} accept="image/*" />
            {formData.image2 && <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'green' }}>Γ£à α╣Çα╕Ñα╕╖α╕¡α╕üα╕úα╕╣α╕¢α╣âα╕½α╕íα╣êα╣üα╕Ñα╣ëα╕º</div>}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}>
            {editId ? 'α╕Üα╕▒α╕Öα╕ùα╕╢α╕üα╕üα╕▓α╕úα╣üα╕üα╣ëα╣äα╕é' : 'α╣Çα╕₧α╕┤α╣êα╕íα╕úα╕╣α╕¢α╕òα╕▒α╕ºα╕¡α╕óα╣êα╕▓α╕çα╕¬α╕┤α╕Öα╕äα╣ëα╕▓'}
          </button>
          {editId && (
            <button type="button" onClick={handleCancelEdit} style={{ padding: '0.8rem 2rem', fontSize: '1rem', backgroundColor: '#e0e0e0', color: '#333', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
              α╕óα╕üα╣Çα╕Ñα╕┤α╕üα╣üα╕üα╣ëα╣äα╕é
            </button>
          )}
        </div>
        {status && <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: status.includes('Γ£à') ? '#d4edda' : '#f8d7da', color: status.includes('Γ£à') ? '#155724' : '#721c24', borderRadius: '8px', fontWeight: 'bold' }}>{status}</div>}
      </form>

      <div>
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary-blue)' }}>α╕úα╕▓α╕óα╕üα╕▓α╕úα╕úα╕╣α╕¢α╕òα╕▒α╕ºα╕¡α╕óα╣êα╕▓α╕çα╕¬α╕┤α╕Öα╕äα╣ëα╕▓α╕ùα╕▒α╣ëα╕çα╕½α╕íα╕ö</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {sampleList.map(item => (
            <div key={item.id} className="premium-card" style={{ overflow: 'hidden' }}>
              <div style={{ height: '150px', backgroundColor: '#f0f0f0', position: 'relative' }}>
                <img src={"https://nas.goodfilmshop.com" + item.image1} alt="Main" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex' }}>
                  <button onClick={() => handleEdit(item)} style={{ backgroundColor: 'var(--primary-blue)', color: 'white', border: 'none', padding: '0.4rem', borderRadius: '50%', cursor: 'pointer', display: 'flex', marginRight: '0.5rem' }}><Edit2 size={16} /></button>
                  <button onClick={() => { if(window.confirm('α╕äα╕╕α╕ôα╣üα╕Öα╣êα╣âα╕êα╕½α╕úα╕╖α╕¡α╣äα╕íα╣êα╕ùα╕╡α╣êα╕êα╕░α╕Ñα╕Üα╕úα╕╣α╕¢α╕òα╕▒α╕ºα╕¡α╕óα╣êα╕▓α╕çα╕Öα╕╡α╣ë?')) onDelete(item.id); }} style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '0.4rem', borderRadius: '50%', cursor: 'pointer', display: 'flex' }}><X size={16} /></button>
                </div>
              </div>
              <div style={{ padding: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>{item.title}</h4>
                <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 'bold' }}>α╕ïα╕╡α╕úα╕╡α╕¬α╣î:</span> {seriesList.find(s => s.id === item.seriesId)?.title}
                  {item.modelId && <><br/><span style={{ fontWeight: 'bold' }}>α╕úα╕╕α╣êα╕Ö:</span> {modelsList.find(m => m.id === item.modelId)?.name}</>}
                </div>
              </div>
            </div>
          ))}
        </div>
        {sampleList.length === 0 && <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>α╕óα╕▒α╕çα╣äα╕íα╣êα╕íα╕╡α╕éα╣ëα╕¡α╕íα╕╣α╕Ñα╕úα╕╣α╕¢α╕òα╕▒α╕ºα╕¡α╕óα╣êα╕▓α╕çα╕¬α╕┤α╕Öα╕äα╣ëα╕▓</p>}
      </div>
    </div>
  );
}
