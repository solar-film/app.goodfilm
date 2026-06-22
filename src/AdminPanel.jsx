import PortfolioManager from './PortfolioManager';
import CatalogManager from './CatalogManager';
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
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '1rem', flexWrap: 'wrap' }}>
          <button 
            className={`btn ${activeTab === 'portfolio' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('portfolio')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.9rem' }}
          >
            <ImageIcon size={18} /> จัดการรูปผลงาน
          </button>
          <button 
            className={`btn ${activeTab === 'catalog_3m' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('catalog_3m')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.9rem' }}
          >
            <FileText size={18} /> จัดการสเปค 3M
          </button>
          <button 
            className={`btn ${activeTab === 'catalog_bostik' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('catalog_bostik')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.9rem' }}
          >
            <FileText size={18} /> จัดการสเปค Bostik
          </button>
          <button 
            className={`btn ${activeTab === 'downloads' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('downloads')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.9rem' }}
          >
            <Download size={18} /> จัดการไฟล์ดาวน์โหลด
          </button>
          <button 
            className={`btn ${activeTab === 'banners' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('banners')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.9rem' }}
          >
            <ImageIcon size={18} /> จัดการแบนเนอร์
          </button>
          <button 
            className={`btn ${activeTab === 'samples' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('samples')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.9rem' }}
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

        {activeTab === 'catalog_3m' && (
          <CatalogManager 
            allowedGroupIds={['g1', 'g2', 'g3', 'g4', 'g5']}
            groupsList={groupsList}
            seriesList={seriesList} 
            modelsList={modelsList} 
            onRefresh={loadData} 
            onDelete={(endpoint, id) => handleDelete(endpoint, id)} 
          />
        )}

        {activeTab === 'catalog_bostik' && (
          <CatalogManager 
            allowedGroupIds={['g6', 'g7', 'g8']}
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
    image1: '', image2: '', image3: '', image4: '',
    existingImage1: '', existingImage2: '', existingImage3: '', existingImage4: '',
    label1: 'ภาพจำลองความเข้ม มองจากภายนอกอาคาร', label2: 'ภาพจำลองความเข้ม มองจากภายในอาคาร'
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
    setStatus('⏳ กำลังบันทึกข้อมูล...');
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
        setStatus('✅ บันทึกข้อมูลสำเร็จ!');
        setFormData({ title: '', seriesId: formData.seriesId, modelId: '', image1: '', image2: '', image3: '', image4: '', existingImage1: '', existingImage2: '', existingImage3: '', existingImage4: '', label1: 'ภาพจำลองความเข้ม มองจากภายนอกอาคาร', label2: 'ภาพจำลองความเข้ม มองจากภายในอาคาร' });
        setEditId(null);
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
      label1: item.label1 || 'ภาพจำลองความเข้ม มองจากภายนอกอาคาร',
      label2: item.label2 || 'ภาพจำลองความเข้ม มองจากภายในอาคาร'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setFormData({ title: '', seriesId: formData.seriesId, modelId: '', image1: '', image2: '', image3: '', image4: '', existingImage1: '', existingImage2: '', existingImage3: '', existingImage4: '', label1: 'ภาพจำลองความเข้ม มองจากภายนอกอาคาร', label2: 'ภาพจำลองความเข้ม มองจากภายในอาคาร' });
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
          <div style={{ padding: '1rem', border: '1px dashed #ccc', borderRadius: '8px', backgroundColor: 'white' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>คำบรรยายรูปแรก</label>
            <input type="text" className="form-control" value={formData.label1} onChange={e => setFormData({...formData, label1: e.target.value})} style={{ marginBottom: '1rem' }} />
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>ไฟล์รูปแรก</label>
            {formData.existingImage1 && !formData.image1 && <div style={{ marginBottom: '0.5rem', fontSize: '0.85rem', color: '#0056b3' }}>✅ มีรูปเดิมแล้ว (อัพโหลดเพื่อเปลี่ยน)</div>}
            <input type="file" className="form-control" onChange={e => handleImageUpload(e, 'image1')} accept="image/*" />
            {formData.image1 && <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'green' }}>✅ เลือกรูปใหม่แล้ว</div>}
          </div>
          <div style={{ padding: '1rem', border: '1px dashed #ccc', borderRadius: '8px', backgroundColor: 'white' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>คำบรรยายรูปที่สอง</label>
            <input type="text" className="form-control" value={formData.label2} onChange={e => setFormData({...formData, label2: e.target.value})} style={{ marginBottom: '1rem' }} />
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>ไฟล์รูปที่สอง</label>
            {formData.existingImage2 && !formData.image2 && <div style={{ marginBottom: '0.5rem', fontSize: '0.85rem', color: '#0056b3' }}>✅ มีรูปเดิมแล้ว (อัพโหลดเพื่อเปลี่ยน)</div>}
            <input type="file" className="form-control" onChange={e => handleImageUpload(e, 'image2')} accept="image/*" />
            {formData.image2 && <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'green' }}>✅ เลือกรูปใหม่แล้ว</div>}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}>
            {editId ? 'บันทึกการแก้ไข' : 'เพิ่มรูปตัวอย่างสินค้า'}
          </button>
          {editId && (
            <button type="button" onClick={handleCancelEdit} style={{ padding: '0.8rem 2rem', fontSize: '1rem', backgroundColor: '#e0e0e0', color: '#333', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
              ยกเลิกแก้ไข
            </button>
          )}
        </div>
        {status && <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: status.includes('✅') ? '#d4edda' : '#f8d7da', color: status.includes('✅') ? '#155724' : '#721c24', borderRadius: '8px', fontWeight: 'bold' }}>{status}</div>}
      </form>

      <div>
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary-blue)' }}>รายการรูปตัวอย่างสินค้าทั้งหมด</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {sampleList.map(item => (
            <div key={item.id} className="premium-card" style={{ overflow: 'hidden' }}>
              <div style={{ height: '150px', backgroundColor: '#f0f0f0', position: 'relative' }}>
                <img src={"https://nas.goodfilmshop.com" + item.image1} alt="Main" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex' }}>
                  <button onClick={() => handleEdit(item)} style={{ backgroundColor: 'var(--primary-blue)', color: 'white', border: 'none', padding: '0.4rem', borderRadius: '50%', cursor: 'pointer', display: 'flex', marginRight: '0.5rem' }}><Edit2 size={16} /></button>
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
