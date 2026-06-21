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
        <h2 style={{ color: 'var(--primary-blue)', marginBottom: '1rem' }}>ระบบจัดการ (Admin)</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem' }}>กรุณาเข้าใช้งานผ่านหน้าจอคอมพิวเตอร์เท่านั้น</p>
        <button onClick={() => navigate('/')} className="btn btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1.1rem', borderRadius: '12px' }}>กลับสู่หน้าหลัก</button>
      </div>
    );
  }

  const handleDelete = async (endpoint, id) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ที่จะลบรายการนี้?')) return;
    try {
      await fetch(`https://nas.goodfilmshop.com/${endpoint}/${id}`, { method: 'DELETE' });
      loadData();
    } catch (error) {
      console.error(error);
      alert('ลบไม่สำเร็จ');
    }
  };

  return (
    <div className="app-container" style={{ minHeight: '100vh', background: 'var(--bg-light)' }}>
      <header className="app-header" style={{ position: 'relative' }}>
        <div className="nav-container">
          <div onClick={() => navigate('/')} style={{ cursor: 'pointer', color: 'var(--primary-blue)', fontWeight: '500' }}>
            <span>&larr; กลับหน้าแรก</span>
          </div>
          <h2 style={{ color: 'var(--primary-blue)', margin: 0, fontSize: '1.2rem' }}>ระบบจัดการหลังบ้าน (CMS)</h2>
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
            <ImageIcon size={18} /> จัดการรูปผลงาน
          </button>
          <button 
            className={`btn ${activeTab === 'catalog' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('catalog')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <FileText size={18} /> จัดการรุ่นฟิล์มและสเปค
          </button>
          <button 
            className={`btn ${activeTab === 'downloads' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('downloads')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Download size={18} /> จัดการไฟล์ดาวน์โหลด
          </button>
          <button 
            className={`btn ${activeTab === 'banners' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('banners')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <ImageIcon size={18} /> จัดการแบนเนอร์
          </button>
          <button 
            className={`btn ${activeTab === 'samples' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('samples')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <ImageIcon size={18} /> จัดการรูปตัวอย่างสินค้า
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

// --- PORTFOLIO MANAGER ---
function PortfolioManager({ seriesList, modelsList, portfolioList, onRefresh, onDelete }) {
  const [formData, setFormData] = useState({
    title: '', seriesId: '', modelId: '', beforeImage: '', afterImage: '', 
    image1: '', image2: '', image3: '', image4: '',
    beforeLabel: 'กระจกใส (ก่อนติด)', afterLabel: 'หลังติดฟิล์ม'
  });
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (seriesList.length > 0 && !formData.seriesId) {
      setFormData(prev => ({ ...prev, seriesId: seriesList[0].id }));
    }
  }, [seriesList]);

  // When seriesId changes, automatically select the first model of that series (if any)
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('กำลังอัปโหลดรูปภาพ...');
    try {
      const uploadImage = async (imgBlob, prefix) => {
        if (!(imgBlob instanceof Blob)) return imgBlob;
        const formDataObj = new FormData();
        formDataObj.append('file', imgBlob, prefix + '.jpg');
        const res = await fetch(`https://nas.goodfilmshop.com/upload-portfolio`, { method: 'POST', body: formDataObj });
        return (await res.json()).url;
      };

      const beforeUrl = await uploadImage(formData.beforeImage, 'before');
      const afterUrl = await uploadImage(formData.afterImage, 'after');
      const img1Url = await uploadImage(formData.image1, 'img1');
      const img2Url = await uploadImage(formData.image2, 'img2');
      const img3Url = await uploadImage(formData.image3, 'img3');
      const img4Url = await uploadImage(formData.image4, 'img4');

      setStatus('กำลังบันทึกข้อมูล...');
      const payload = {
        ...formData,
        id: Date.now().toString(),
        beforeImage: beforeUrl || formData.beforeImage,
        afterImage: afterUrl || formData.afterImage,
        image1: img1Url || formData.image1,
        image2: img2Url || formData.image2,
        image3: img3Url || formData.image3,
        image4: img4Url || formData.image4
      };

      const res = await fetch(`https://nas.goodfilmshop.com/portfolio`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setStatus('✅ บันทึกสำเร็จ!');
        setFormData(p => ({ ...p, title: '', beforeImage: '', afterImage: '', image1: '', image2: '', image3: '', image4: '' }));
        e.target.reset(); // clear file inputs
        onRefresh();
        setTimeout(() => setStatus(''), 3000);
      } else {
        setStatus('❌ บันทึกไม่สำเร็จ');
      }
    } catch (err) {
      setStatus('❌ ติดต่อเซิร์ฟเวอร์ไม่ได้');
    }
  };

  const inputStyle = { width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-white)', color: 'var(--text-main)' };

  return (
    <div className="admin-grid">
      <div className="premium-card" style={{ padding: '1.5rem', alignSelf: 'start' }}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary-blue)' }}>เพิ่มผลงานใหม่</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>เลือกรุ่นฟิล์ม 3M</label>
              <select name="seriesId" value={formData.seriesId} onChange={(e) => setFormData({...formData, seriesId: e.target.value})} className="form-control">
                {seriesList.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>เลือก Model</label>
              <select name="modelId" value={formData.modelId} onChange={(e) => setFormData({...formData, modelId: e.target.value})} className="form-control">
                <option value="">-- ไม่ระบุ Model --</option>
                {modelsList.filter(m => m.seriesId === formData.seriesId).map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>หัวข้อผลงาน</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required className="form-control" />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>ภาพก่อนติด</label>
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'beforeImage')} required className="form-control" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>ภาพหลังติด</label>
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'afterImage')} required className="form-control" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>คำบรรยายรูป ก่อนติด (เช่น กระจกใส (ก่อนติด))</label>
              <input type="text" value={formData.beforeLabel} onChange={(e) => setFormData({...formData, beforeLabel: e.target.value})} required className="form-control" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>คำบรรยายรูป หลังติด (เช่น หลังติดฟิล์ม)</label>
              <input type="text" value={formData.afterLabel} onChange={(e) => setFormData({...formData, afterLabel: e.target.value})} required className="form-control" />
            </div>
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>รูปอื่นๆ เพิ่มเติม (ใส่ได้สูงสุด 4 รูป)</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'image1')} className="form-control" />
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'image2')} className="form-control" />
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'image3')} className="form-control" />
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'image4')} className="form-control" />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">บันทึกผลงาน</button>
          {status && <div style={{ textAlign: 'center', color: status.includes('✅') ? 'green' : 'red' }}>{status}</div>}
        </form>
      </div>

      <div>
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary-blue)' }}>รายการผลงานทั้งหมด</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {portfolioList.map(item => (
          <div key={item.id} className="premium-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ fontWeight: '500' }}>{item.title}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Series ID: {item.seriesId} {item.modelId ? `| Model ID: ${item.modelId}` : ''}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', height: '100px' }}>
              <img src={getFullUrl(item.beforeImage)} alt="before" style={{ width: '50%', objectFit: 'cover', borderRadius: '4px' }} />
              <img src={getFullUrl(item.afterImage)} alt="after" style={{ width: '50%', objectFit: 'cover', borderRadius: '4px' }} />
            </div>
            {(item.image1 || item.image2 || item.image3 || item.image4) && (
              <div style={{ display: 'flex', gap: '0.5rem', height: '50px' }}>
                {item.image1 && <img src={getFullUrl(item.image1)} alt="img1" style={{ flex: 1, width: '25%', objectFit: 'cover', borderRadius: '4px' }} />}
                {item.image2 && <img src={getFullUrl(item.image2)} alt="img2" style={{ flex: 1, width: '25%', objectFit: 'cover', borderRadius: '4px' }} />}
                {item.image3 && <img src={getFullUrl(item.image3)} alt="img3" style={{ flex: 1, width: '25%', objectFit: 'cover', borderRadius: '4px' }} />}
                {item.image4 && <img src={getFullUrl(item.image4)} alt="img4" style={{ flex: 1, width: '25%', objectFit: 'cover', borderRadius: '4px' }} />}
              </div>
            )}
            <button onClick={() => onDelete(item.id)} className="btn btn-outline" style={{ borderColor: 'red', color: 'red', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
              <Trash2 size={16} /> ลบผลงานนี้
            </button>
          </div>
        ))}
      </div>
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
                  {groupsList?.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
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
                    <input type="text" value={editSeriesData.title} onChange={e => setEditSeriesData({...editSeriesData, title: e.target.value})} className="form-control" placeholder="ชื่อ Series" />
                    <input type="text" value={editSeriesData.desc} onChange={e => setEditSeriesData({...editSeriesData, desc: e.target.value})} className="form-control" placeholder="คำอธิบายสั้นๆ" />
                    <select value={editSeriesData.groupId} onChange={e => setEditSeriesData({...editSeriesData, groupId: e.target.value})} className="form-control" style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                      {groupsList?.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
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
function DownloadManager({ seriesList, downloadsList, onRefresh, onDelete }) {
  const [formData, setFormData] = useState({
    title: '', category: 'catalog', seriesId: ''
  });
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  
  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'catalog': return 'แคตตาล็อก';
      case 'spec': return 'Data Sheet';
      case 'test_report': return 'Test Report';
      case 'other': return 'อื่นๆ';
      default: return 'เอกสาร';
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
        alert('แก้ไขไม่สำเร็จ');
      }
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาด');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setStatus('❌ กรุณาเลือกไฟล์');
      return;
    }
    setStatus('กำลังอัปโหลด...');
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
        setStatus('✅ บันทึกสำเร็จ!');
        setFormData({ title: '', category: 'catalog', seriesId: '' });
        setFile(null);
        e.target.reset();
        onRefresh();
        setTimeout(() => setStatus(''), 3000);
      } else {
        setStatus('❌ บันทึกไม่สำเร็จ');
      }
    } catch (err) {
      console.error(err);
      setStatus('❌ เกิดข้อผิดพลาด');
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
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary-blue)' }}>อัปโหลดไฟล์ใหม่</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>ชื่อเอกสาร / แคตตาล็อก</label>
            <input type="text" className="form-control" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required placeholder="เช่น แคตตาล็อก 3M ฟิล์มนิรภัย" />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>หมวดหมู่</label>
            <select className="form-control" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
              <option value="catalog">แคตตาล็อก</option>
              <option value="spec">Data Sheet</option>
              <option value="test_report">Test Report</option>
              <option value="other">อื่นๆ</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>นำไปแสดงในรุ่นฟิล์ม (ตัวเลือกเสริม)</label>
            <select className="form-control" value={formData.seriesId} onChange={e => setFormData({...formData, seriesId: e.target.value})}>
              <option value="">-- ไม่ระบุ (แสดงทุกรุ่น หรือ ตามชื่อไฟล์) --</option>
              {seriesList?.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>ไฟล์เอกสาร (PDF, JPG, PNG)</label>
            <input type="file" className="form-control" onChange={e => setFile(e.target.files[0])} required accept=".pdf,image/png,image/jpeg" />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>อัปโหลดและบันทึก</button>
          {status && <div style={{ marginTop: '1rem', color: status.includes('❌') ? 'red' : 'green', fontWeight: 'bold' }}>{status}</div>}
        </form>
      </div>

      <div className="card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary-blue)' }}>รายการไฟล์ทั้งหมด</h3>
        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem', fontWeight: 'bold' }}>ชื่อเอกสาร</label>
            <input type="text" className="form-control" placeholder="ค้นหาชื่อเอกสาร..." value={filterTitle} onChange={e => setFilterTitle(e.target.value)} />
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem', fontWeight: 'bold' }}>แสดงในรุ่นฟิล์ม</label>
            <select className="form-control" value={filterSeries} onChange={e => setFilterSeries(e.target.value)}>
              <option value="">-- ทั้งหมด --</option>
              {seriesList?.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem', fontWeight: 'bold' }}>หมวดหมู่</label>
            <select className="form-control" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
              <option value="">-- ทั้งหมด --</option>
              <option value="catalog">แคตตาล็อก</option>
              <option value="spec">Data Sheet</option>
              <option value="test_report">Test Report</option>
              <option value="other">อื่นๆ</option>
            </select>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
              <th style={{ padding: '0.5rem' }}>ไฟล์</th>
              <th style={{ padding: '0.5rem' }}>ชื่อเอกสาร</th>
              <th style={{ padding: '0.5rem' }}>แสดงในรุ่นฟิล์ม</th>
              <th style={{ padding: '0.5rem' }}>หมวดหมู่</th>
              <th style={{ padding: '0.5rem', textAlign: 'right' }}>จัดการ</th>
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
                      <option value="">- ไม่ระบุ -</option>
                      {seriesList?.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                    </select>
                  ) : (
                    item.seriesId ? seriesList?.find(s => s.id === item.seriesId)?.title || '-' : '-'
                  )}
                </td>
                <td style={{ padding: '0.5rem' }}>
                  {editingId === item.id ? (
                    <select className="form-control" value={editData.category} onChange={e => setEditData({...editData, category: e.target.value})} style={{ padding: '0.3rem', width: '120px' }}>
                      <option value="catalog">แคตตาล็อก</option>
                      <option value="spec">Data Sheet</option>
                      <option value="test_report">Test Report</option>
                      <option value="other">อื่นๆ</option>
                    </select>
                  ) : (
                    getCategoryLabel(item.category)
                  )}
                </td>
                <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                  {editingId === item.id ? (
                    <>
                      <button onClick={() => handleEditSave(item.id)} style={{ color: 'green', border: 'none', background: 'none', cursor: 'pointer', marginRight: '0.5rem' }} title="บันทึก"><Check size={18}/></button>
                      <button onClick={() => setEditingId(null)} style={{ color: '#666', border: 'none', background: 'none', cursor: 'pointer' }} title="ยกเลิก"><X size={18}/></button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditingId(item.id); setEditData({ title: item.title, seriesId: item.seriesId || '', category: item.category || 'catalog' }); }} style={{ color: 'var(--primary-blue)', border: 'none', background: 'none', cursor: 'pointer', marginRight: '0.5rem' }} title="แก้ไข"><Edit2 size={18}/></button>
                      <button onClick={() => onDelete(item.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }} title="ลบ"><Trash2 size={18}/></button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {downloadsList.length === 0 && <tr><td colSpan="5" style={{ padding: '1rem', textAlign: 'center' }}>ไม่มีข้อมูล</td></tr>}
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
      setStatus('❌ กรุณาเลือกไฟล์รูปภาพ');
      return;
    }
    setStatus('กำลังอัปโหลด...');
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
        setStatus('✅ บันทึกแบนเนอร์สำเร็จ!');
        setFormData({ linkUrl: '' });
        setFile(null);
        e.target.reset();
        onRefresh();
        setTimeout(() => setStatus(''), 3000);
      } else {
        setStatus('❌ บันทึกไม่สำเร็จ');
      }
    } catch (err) {
      setStatus('❌ เกิดข้อผิดพลาดในการอัปโหลด');
    }
  };

  return (
    <div className="admin-grid">
      <div className="premium-card" style={{ padding: '1.5rem', alignSelf: 'start' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary-blue)' }}>เพิ่มแบนเนอร์ใหม่</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>ไฟล์รูปภาพ (แนะนำสัดส่วนแนวนอน)</label>
            <input type="file" className="form-control" onChange={e => setFile(e.target.files[0])} required accept="image/*" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>ลิงก์เมื่อกดแบนเนอร์ (ไม่บังคับ)</label>
            <input type="text" className="form-control" value={formData.linkUrl} onChange={e => setFormData({...formData, linkUrl: e.target.value})} placeholder="เช่น https://... หรือ /?series=..." />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>อัปโหลดแบนเนอร์</button>
          {status && <div style={{ marginTop: '1rem', color: status.includes('❌') ? 'red' : 'green', fontWeight: 'bold' }}>{status}</div>}
        </form>
      </div>

      <div>
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary-blue)' }}>รายการแบนเนอร์ทั้งหมด</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {bannersList.map(item => (
            <div key={item.id} className="premium-card" style={{ padding: '1rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <img src={getFullUrl(item.imageUrl)} alt="Banner" style={{ width: '150px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--text-main)' }}>ลิงก์: {item.linkUrl || 'ไม่มีลิงก์'}</p>
              </div>
              <button onClick={() => onDelete('banners', item.id)} className="btn btn-outline" style={{ borderColor: 'red', color: 'red', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Trash2 size={16} /> ลบ
              </button>
            </div>
          ))}
          {bannersList.length === 0 && <p style={{ color: 'var(--text-muted)' }}>ยังไม่มีแบนเนอร์</p>}
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
    image1: '', image2: '', image3: '', image4: ''
  });
  const [status, setStatus] = useState('');

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
    if (!formData.image1) {
      setStatus('❌ กรุณาอัพโหลดรูปภาพหลักอย่างน้อย 1 รูป');
      return;
    }
    setStatus('⏳ กำลังอัพโหลดรูปภาพและบันทึกข้อมูล...');
    try {
      const [i1, i2, i3, i4] = await Promise.all([
        uploadFile(formData.image1, 'sample-1'),
        uploadFile(formData.image2, 'sample-2'),
        uploadFile(formData.image3, 'sample-3'),
        uploadFile(formData.image4, 'sample-4')
      ]);

      const res = await fetch('https://nas.goodfilmshop.com/portfolio', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: Date.now().toString(), 
          type: 'sample',
          seriesId: formData.seriesId, 
          modelId: formData.modelId, 
          title: formData.title,
          image1: i1, image2: i2, image3: i3, image4: i4
        })
      });
      if (res.ok) {
        setStatus('✅ บันทึกข้อมูลสำเร็จ!');
        setFormData({ ...formData, title: '', image1: '', image2: '', image3: '', image4: '' });
        e.target.reset();
        onRefresh();
        setTimeout(() => setStatus(''), 3000);
      } else {
        setStatus('❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    } catch (err) {
      console.error(err);
      setStatus('❌ เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    }
  };

  return (
    <div className="admin-card">
      <h2 style={{ color: 'var(--primary-blue)', marginBottom: '1.5rem' }}>จัดการรูปตัวอย่างสินค้า</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>ซีรีส์ฟิล์ม</label>
            <select className="form-control" value={formData.seriesId} onChange={e => setFormData({...formData, seriesId: e.target.value})} required>
              {seriesList.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
          </div>
          <div style={{ flex: '1 1 300px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>รุ่นย่อย (ไม่ระบุก็ได้)</label>
            <select className="form-control" value={formData.modelId} onChange={e => setFormData({...formData, modelId: e.target.value})}>
              <option value="">-- ไม่ระบุ --</option>
              {modelsList.filter(m => m.seriesId === formData.seriesId).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>หัวข้อ / คำบรรยายสั้นๆ</label>
          <input type="text" className="form-control" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="เช่น รูปตัวอย่างติดตั้งฟิล์มรุ่น..." required />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', border: '1px dashed #ccc', borderRadius: '8px', backgroundColor: 'white' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>รูปหลัก (ต้องมี) <span style={{ color: 'red' }}>*</span></label>
            <input type="file" className="form-control" onChange={e => handleImageUpload(e, 'image1')} accept="image/*" required />
            {formData.image1 && <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'green' }}>✅ เลือกรูปแล้ว</div>}
          </div>
          <div style={{ padding: '1rem', border: '1px dashed #ccc', borderRadius: '8px', backgroundColor: 'white' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>รูปเพิ่มเติม 1 (ถ้ามี)</label>
            <input type="file" className="form-control" onChange={e => handleImageUpload(e, 'image2')} accept="image/*" />
            {formData.image2 && <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'green' }}>✅ เลือกรูปแล้ว</div>}
          </div>
          <div style={{ padding: '1rem', border: '1px dashed #ccc', borderRadius: '8px', backgroundColor: 'white' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>รูปเพิ่มเติม 2 (ถ้ามี)</label>
            <input type="file" className="form-control" onChange={e => handleImageUpload(e, 'image3')} accept="image/*" />
            {formData.image3 && <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'green' }}>✅ เลือกรูปแล้ว</div>}
          </div>
          <div style={{ padding: '1rem', border: '1px dashed #ccc', borderRadius: '8px', backgroundColor: 'white' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>รูปเพิ่มเติม 3 (ถ้ามี)</label>
            <input type="file" className="form-control" onChange={e => handleImageUpload(e, 'image4')} accept="image/*" />
            {formData.image4 && <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'green' }}>✅ เลือกรูปแล้ว</div>}
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem', fontSize: '1rem', marginTop: '1rem' }}>บันทึกรูปตัวอย่างสินค้า</button>
        {status && <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: status.includes('✅') ? '#d4edda' : '#f8d7da', color: status.includes('✅') ? '#155724' : '#721c24', borderRadius: '8px', fontWeight: 'bold' }}>{status}</div>}
      </form>

      <div>
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary-blue)' }}>รายการรูปตัวอย่างสินค้าทั้งหมด</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {sampleList.map(item => (
            <div key={item.id} className="premium-card" style={{ overflow: 'hidden' }}>
              <div style={{ height: '150px', backgroundColor: '#f0f0f0', position: 'relative' }}>
                <img src={"https://nas.goodfilmshop.com" + item.image1} alt="Main" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                  <button onClick={() => { if(window.confirm('คุณแน่ใจหรือไม่ที่จะลบรูปตัวอย่างนี้?')) onDelete(item.id); }} style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '0.4rem', borderRadius: '50%', cursor: 'pointer', display: 'flex' }}><X size={16} /></button>
                </div>
              </div>
              <div style={{ padding: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>{item.title}</h4>
                <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 'bold' }}>ซีรีส์:</span> {seriesList.find(s => s.id === item.seriesId)?.title}
                  {item.modelId && <><br/><span style={{ fontWeight: 'bold' }}>รุ่น:</span> {modelsList.find(m => m.id === item.modelId)?.name}</>}
                </div>
              </div>
            </div>
          ))}
        </div>
        {sampleList.length === 0 && <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>ยังไม่มีข้อมูลรูปตัวอย่างสินค้า</p>}
      </div>
    </div>
  );
}
