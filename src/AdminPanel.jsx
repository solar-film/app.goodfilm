import PortfolioManager from './PortfolioManager';
import CatalogManager from './CatalogManager';
import VideoManager from './VideoManager';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, FileText, Image as ImageIcon, Download, Edit2, Check, X, PlayCircle } from 'lucide-react';
import 'react-quill-new/dist/quill.snow.css';
import './App.css';
import { getDownloadBrand, getProductBrandLabel, getSeriesBrand, PRODUCT_BRANDS } from './downloadBrands';
import { adminFetch, apiFetch, assetUrl } from './apiConfig';
import { getSampleImages, SAMPLE_IMAGE_SLOTS } from './sampleImages';

const getFullUrl = assetUrl;

function AdminLogin({ onSuccess }) {
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    try {
      const response = await apiFetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (!response.ok) {
        setStatus(response.status === 429 ? 'ลองใหม่ภายหลัง เนื่องจากกรอกรหัสผิดหลายครั้ง' : 'รหัสผ่านไม่ถูกต้อง');
        return;
      }
      setPassword('');
      onSuccess();
    } catch {
      setStatus('เชื่อมต่อระบบไม่ได้ กรุณาลองใหม่');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg-light)', padding: '1rem' }}>
      <form onSubmit={handleLogin} className="premium-card" style={{ width: '100%', maxWidth: '420px', padding: '2rem' }}>
        <h1 style={{ color: 'var(--primary-blue)', fontSize: '1.6rem', marginBottom: '0.5rem' }}>เข้าสู่ระบบจัดการข้อมูล</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>กรอกรหัสผ่านผู้ดูแลเพื่อจัดการข้อมูลและไฟล์</p>
        <label htmlFor="admin-password" style={{ display: 'block', fontWeight: '700', marginBottom: '0.5rem' }}>รหัสผ่าน</label>
        <input
          id="admin-password"
          type="password"
          className="form-control"
          value={password}
          onChange={event => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />
        {status && <p role="alert" style={{ color: 'var(--primary-red)', marginTop: '0.75rem' }}>{status}</p>}
        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem', fontSize: '1rem' }} disabled={submitting}>{submitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</button>
      </form>
    </div>
  );
}

function AdminPanel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('portfolio'); // 'portfolio' | 'catalog' | 'downloads' | 'banners'
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [authState, setAuthState] = useState('loading');

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
  const [videosList, setVideosList] = useState([]);
  
  const loadData = useCallback(async () => {
    const ts = Date.now();
    const responses = await Promise.all([
      adminFetch(`/groups?_=${ts}`),
      adminFetch(`/series?_=${ts}`),
      adminFetch(`/models?_=${ts}`),
      adminFetch(`/portfolio?_=${ts}`),
      adminFetch(`/downloads?_=${ts}`),
      adminFetch(`/banners?_=${ts}`),
      adminFetch(`/videos?_=${ts}`)
    ]);
    if (responses.some(response => response.status === 401)) {
      setAuthState('anonymous');
      return;
    }
    if (responses.some(response => !response.ok)) throw new Error('Could not load admin data');
    const [groups, series, models, portfolio, downloads, banners, videos] = await Promise.all(responses.map(response => response.json()));
    setGroupsList(groups);
    setSeriesList(series);
    setModelsList(models.sort((a, b) => {
      const numA = parseInt(a.name.match(/\d+/)?.[0] || 0);
      const numB = parseInt(b.name.match(/\d+/)?.[0] || 0);
      return numA - numB;
    }));
    setPortfolioList(portfolio);
    setDownloadsList(downloads);
    setBannersList(banners);
    setVideosList(videos);
  }, []);

  useEffect(() => {
    apiFetch('/auth/status')
      .then(response => response.json())
      .then(result => setAuthState(result.authenticated ? 'authenticated' : 'anonymous'))
      .catch(() => setAuthState('anonymous'));
  }, []);

  useEffect(() => {
    if (authState === 'authenticated') loadData().catch(() => setAuthState('anonymous'));
  }, [authState, loadData]);

  useEffect(() => {
    const handleUnauthorized = () => setAuthState('anonymous');
    window.addEventListener('goodfilm:admin-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('goodfilm:admin-unauthorized', handleUnauthorized);
  }, []);

  if (authState === 'loading') {
    return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>กำลังตรวจสอบสิทธิ์...</div>;
  }

  if (authState !== 'authenticated') {
    return <AdminLogin onSuccess={() => setAuthState('authenticated')} />;
  }

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
      const response = await adminFetch(`/${endpoint}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Delete failed');
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
          <button
            type="button"
            className="btn btn-outline"
            onClick={async () => {
              await apiFetch('/auth/logout', { method: 'POST' });
              setAuthState('anonymous');
            }}
          >
            ออกจากระบบ
          </button>
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
          <button 
            className={`btn ${activeTab === 'videos' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('videos')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.9rem' }}
          >
            <PlayCircle size={18} /> จัดการวิดีโอ YouTube
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

        {activeTab === 'videos' && (
          <VideoManager 
            seriesList={seriesList} 
            videosList={videosList} 
            onRefresh={loadData} 
            onDelete={(id) => handleDelete('videos', id)} 
          />
        )}

        {activeTab === 'catalog_3m' && (
          <CatalogManager 
            allowedGroupIds={['g1', 'g2', 'g3', 'g4', 'g5', 'g9']}
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
    title: '', brand: PRODUCT_BRANDS.THREE_M, category: 'catalog', seriesId: ''
  });
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [recoveryStatus, setRecoveryStatus] = useState('');
  const [isRecovering, setIsRecovering] = useState(false);
  
  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'catalog': return 'แคตตาล็อก';
      case 'spec': return 'Data Sheet';
      case 'test_report': return 'Test Report';
      case 'reference': return 'เอกสารอ้างอิง';
      case 'other': return 'อื่นๆ';
      default: return 'เอกสาร';
    }
  };
  
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ title: '', brand: PRODUCT_BRANDS.THREE_M, seriesId: '', category: 'catalog' });
  
  const [filterTitle, setFilterTitle] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterSeries, setFilterSeries] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const handleEditSave = async (id) => {
    try {
      const res = await adminFetch(`/downloads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editData.title, brand: editData.brand, seriesId: editData.seriesId, category: editData.category })
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
      data.append('brand', formData.brand);
      data.append('category', formData.category);
      data.append('title', formData.title);
      data.append('seriesId', formData.seriesId || '');
      data.append('file', file);
      
      const uploadRes = await adminFetch('/upload-download-and-register', {
        method: 'POST', body: data
      });
      
      if (!uploadRes.ok) throw new Error('Upload failed');
      
      if (uploadRes.ok) {
        setStatus('✅ บันทึกสำเร็จ!');
        setFormData({ title: '', brand: PRODUCT_BRANDS.THREE_M, category: 'catalog', seriesId: '' });
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

  const handleRecoverTestReports = async () => {
    setIsRecovering(true);
    setRecoveryStatus('กำลังตรวจหาไฟล์ Test Report บน NAS...');
    try {
      const previewRes = await adminFetch(`/maintenance/orphan-downloads?category=test_report&_=${Date.now()}`);
      if (!previewRes.ok) throw new Error('Preview failed');
      const preview = await previewRes.json();
      if (preview.count === 0) {
        setRecoveryStatus('ไม่พบไฟล์ Test Report ที่ตกหล่นในโฟลเดอร์ NAS');
        return;
      }

      const shouldRecover = window.confirm(`พบไฟล์ Test Report ที่ยังอยู่บน NAS แต่ไม่อยู่ในรายการ ${preview.count} ไฟล์ ต้องการกู้กลับทั้งหมดหรือไม่?`);
      if (!shouldRecover) {
        setRecoveryStatus('ยกเลิกการกู้คืนแล้ว');
        return;
      }

      const recoverRes = await adminFetch('/maintenance/recover-downloads?category=test_report', { method: 'POST' });
      if (!recoverRes.ok) throw new Error('Recovery failed');
      const result = await recoverRes.json();
      setRecoveryStatus(`กู้รายการ Test Report กลับมาแล้ว ${result.count} ไฟล์`);
      onRefresh();
    } catch (error) {
      console.error(error);
      setRecoveryStatus('กู้รายการไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อกับ NAS');
    } finally {
      setIsRecovering(false);
    }
  };

  const filteredDownloads = downloadsList.filter(item => {
    const matchTitle = filterTitle === '' || item.title.toLowerCase().includes(filterTitle.toLowerCase());
    const matchBrand = filterBrand === '' || getDownloadBrand(item, seriesList) === filterBrand;
    const matchSeries = filterSeries === '' || item.seriesId === filterSeries;
    const matchCategory = filterCategory === '' || item.category === filterCategory;
    return matchTitle && matchBrand && matchSeries && matchCategory;
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
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>กลุ่มผลิตภัณฑ์</label>
            <select
              className="form-control"
              value={formData.brand}
              onChange={e => {
                const brand = e.target.value;
                const selectedSeries = seriesList.find(s => s.id === formData.seriesId);
                setFormData({
                  ...formData,
                  brand,
                  seriesId: selectedSeries && getSeriesBrand(selectedSeries) !== brand ? '' : formData.seriesId
                });
              }}
            >
              <option value={PRODUCT_BRANDS.THREE_M}>ฟิล์ม 3M</option>
              <option value={PRODUCT_BRANDS.BOSTIK}>ผลิตภัณฑ์ Bostik</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>หมวดหมู่</label>
            <select className="form-control" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
              <option value="catalog">แคตตาล็อก</option>
              <option value="spec">Data Sheet</option>
              <option value="test_report">Test Report</option>
              <option value="reference">เอกสารอ้างอิง</option>
              <option value="other">อื่นๆ</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>นำไปแสดงในรุ่นสินค้า (ตัวเลือกเสริม)</label>
            <select className="form-control" value={formData.seriesId} onChange={e => setFormData({...formData, seriesId: e.target.value})}>
              <option value="">-- ไม่ระบุ (แสดงทุกรุ่น หรือ ตามชื่อไฟล์) --</option>
              {seriesList?.filter(s => getSeriesBrand(s) === formData.brand).map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
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
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button type="button" className="btn btn-outline" onClick={handleRecoverTestReports} disabled={isRecovering}>
            {isRecovering ? 'กำลังตรวจสอบ...' : 'กู้ไฟล์ Test Report จาก NAS'}
          </button>
        </div>
        {recoveryStatus && <div style={{ marginBottom: '1rem', padding: '0.8rem', background: '#eef5ff', borderRadius: '8px', color: 'var(--primary-blue)' }}>{recoveryStatus}</div>}
        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem', fontWeight: 'bold' }}>ชื่อเอกสาร</label>
            <input type="text" className="form-control" placeholder="ค้นหาชื่อเอกสาร..." value={filterTitle} onChange={e => setFilterTitle(e.target.value)} />
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem', fontWeight: 'bold' }}>กลุ่มผลิตภัณฑ์</label>
            <select className="form-control" value={filterBrand} onChange={e => setFilterBrand(e.target.value)}>
              <option value="">-- ทั้งหมด --</option>
              <option value={PRODUCT_BRANDS.THREE_M}>ฟิล์ม 3M</option>
              <option value={PRODUCT_BRANDS.BOSTIK}>ผลิตภัณฑ์ Bostik</option>
            </select>
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
              <option value="reference">เอกสารอ้างอิง</option>
              <option value="other">อื่นๆ</option>
            </select>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
              <th style={{ padding: '0.5rem' }}>ไฟล์</th>
              <th style={{ padding: '0.5rem' }}>ชื่อเอกสาร</th>
              <th style={{ padding: '0.5rem' }}>กลุ่มผลิตภัณฑ์</th>
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
                    <select
                      className="form-control"
                      value={editData.brand}
                      onChange={e => {
                        const brand = e.target.value;
                        const selectedSeries = seriesList.find(s => s.id === editData.seriesId);
                        setEditData({
                          ...editData,
                          brand,
                          seriesId: selectedSeries && getSeriesBrand(selectedSeries) !== brand ? '' : editData.seriesId
                        });
                      }}
                      style={{ padding: '0.3rem', width: '150px' }}
                    >
                      <option value={PRODUCT_BRANDS.THREE_M}>ฟิล์ม 3M</option>
                      <option value={PRODUCT_BRANDS.BOSTIK}>ผลิตภัณฑ์ Bostik</option>
                    </select>
                  ) : (
                    getProductBrandLabel(getDownloadBrand(item, seriesList))
                  )}
                </td>
                <td style={{ padding: '0.5rem' }}>
                  {editingId === item.id ? (
                    <select className="form-control" value={editData.seriesId} onChange={e => setEditData({...editData, seriesId: e.target.value})} style={{ padding: '0.3rem', width: '150px' }}>
                      <option value="">- ไม่ระบุ -</option>
                      {seriesList?.filter(s => getSeriesBrand(s) === editData.brand).map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
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
                      <option value="reference">เอกสารอ้างอิง</option>
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
                      <button onClick={() => { setEditingId(item.id); setEditData({ title: item.title, brand: getDownloadBrand(item, seriesList), seriesId: item.seriesId || '', category: item.category || 'catalog' }); }} style={{ color: 'var(--primary-blue)', border: 'none', background: 'none', cursor: 'pointer', marginRight: '0.5rem' }} title="แก้ไข"><Edit2 size={18}/></button>
                      <button onClick={() => onDelete(item.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }} title="ลบ"><Trash2 size={18}/></button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {filteredDownloads.length === 0 && <tr><td colSpan="6" style={{ padding: '1rem', textAlign: 'center' }}>ไม่มีข้อมูล</td></tr>}
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
      
      const uploadRes = await adminFetch('/upload-banner', {
        method: 'POST', body: data
      });
      if (!uploadRes.ok) throw new Error('Upload failed');
      const uploadData = await uploadRes.json();

      const res = await adminFetch('/banners', {
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
    } catch {
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
            <input type="file" className="form-control" onChange={e => setFile(e.target.files[0])} required accept="image/jpeg,image/png,image/webp" />
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
const getSampleExistingImageKey = (imageKey) => `existing${imageKey.charAt(0).toUpperCase()}${imageKey.slice(1)}`;

const createEmptySampleForm = (seriesId = '') => ({
  title: '', seriesId, modelId: '',
  image1: null, image2: null, image3: null, image4: null,
  existingImage1: '', existingImage2: '', existingImage3: '', existingImage4: '',
  label1: '', label2: '', label3: '', label4: ''
});

const hasOwnValue = (item, key) => Object.prototype.hasOwnProperty.call(item, key);

const isPendingSample = (item) => {
  const title = String(item?.title || '');
  const id = String(item?.id || '');
  return !item?.seriesId
    || Boolean(item?.recoveredFrom)
    || id.startsWith('recovered-')
    || title.startsWith('Recovered sample pending review');
};

function SampleManager({ seriesList, modelsList, portfolioList, onRefresh, onDelete }) {
  const [formData, setFormData] = useState(() => createEmptySampleForm());
  const [status, setStatus] = useState('');
  const [editId, setEditId] = useState(null);
  const [sampleFilter, setSampleFilter] = useState('published');

  const sampleList = portfolioList.filter(p => p.type === 'sample');
  const publishedSamples = sampleList.filter(item => !isPendingSample(item));
  const pendingSamples = sampleList.filter(isPendingSample);
  const visibleSampleList = sampleFilter === 'all'
    ? sampleList
    : sampleFilter === 'pending'
      ? pendingSamples
      : publishedSamples;
  const visibleImageCount = visibleSampleList.reduce((total, item) => total + getSampleImages(item).length, 0);

  useEffect(() => {
    if (formData.modelId && !modelsList.some(m => m.seriesId === formData.seriesId && m.id === formData.modelId)) {
      setFormData(prev => ({ ...prev, modelId: '' }));
    }
  }, [formData.seriesId, formData.modelId, modelsList]);

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
    setStatus('⏳ กำลังบันทึกข้อมูล...');
    try {
      const payloadId = editId || Date.now().toString();
      if (!formData.image1 && !formData.existingImage1) {
        setStatus('❌ กรุณาเลือกรูปแรกก่อนบันทึก');
        return;
      }
      const metadata = {
        id: payloadId,
        seriesId: formData.seriesId,
        modelId: formData.modelId,
        title: formData.title
      };
      for (const { imageKey, labelKey } of SAMPLE_IMAGE_SLOTS) {
        metadata[labelKey] = formData[labelKey];
        metadata[getSampleExistingImageKey(imageKey)] = formData[getSampleExistingImageKey(imageKey)] || '';
      }

      const payload = new FormData();
      Object.entries(metadata).forEach(([key, value]) => payload.append(key, value));
      for (const { imageKey } of SAMPLE_IMAGE_SLOTS) {
        if (formData[imageKey]) {
          payload.append(imageKey, new File([formData[imageKey]], `${imageKey}-${payloadId}.jpg`, { type: 'image/jpeg' }));
        }
      }

      const res = await adminFetch('/upload-sample-and-register', { method: 'POST', body: payload });
      if (res.ok) {
        setStatus('✅ บันทึกข้อมูลสำเร็จ!');
        setFormData(createEmptySampleForm(formData.seriesId));
        setEditId(null);
        e.target.reset();
        onRefresh();
        setTimeout(() => setStatus(''), 3000);
      } else {
        const errorPayload = await res.json().catch(() => ({}));
        setStatus(`❌ ${errorPayload.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'}`);
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
      label1: hasOwnValue(item, 'label1') ? (item.label1 || '') : SAMPLE_IMAGE_SLOTS[0].defaultLabel,
      label2: hasOwnValue(item, 'label2') ? (item.label2 || '') : SAMPLE_IMAGE_SLOTS[1].defaultLabel,
      label3: hasOwnValue(item, 'label3') ? (item.label3 || '') : '',
      label4: hasOwnValue(item, 'label4') ? (item.label4 || '') : ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setFormData(createEmptySampleForm(formData.seriesId));
  };

  return (
    <div className="admin-card">
      <h2 style={{ color: 'var(--primary-blue)', marginBottom: '1.5rem' }}>จัดการรูปตัวอย่างสินค้า</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>ซีรีส์ฟิล์ม</label>
            <select className="form-control" value={formData.seriesId} onChange={e => setFormData({...formData, seriesId: e.target.value, modelId: ''})}>
              <option value="">-- รอตรวจสอบ / ยังไม่ระบุซีรีส์ --</option>
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
          <input type="text" className="form-control" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="เช่น รูปตัวอย่างติดตั้งฟิล์มรุ่น..." />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {SAMPLE_IMAGE_SLOTS.map(({ imageKey, labelKey, name }) => {
            const existingImageKey = `existing${imageKey.charAt(0).toUpperCase()}${imageKey.slice(1)}`;
            return (
              <div key={imageKey} style={{ padding: '1rem', border: '1px dashed #ccc', borderRadius: '8px', backgroundColor: 'white' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>คำบรรยาย{name}</label>
                <input type="text" className="form-control" value={formData[labelKey]} onChange={e => setFormData({...formData, [labelKey]: e.target.value})} style={{ marginBottom: '1rem' }} />
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>ไฟล์{name}{imageKey === 'image1' ? ' *' : ''}</label>
                {formData[existingImageKey] && !formData[imageKey] && (
                  <div style={{ marginBottom: '0.5rem', fontSize: '0.85rem', color: '#0056b3' }}>✅ มีรูปเดิมแล้ว (อัปโหลดเพื่อเปลี่ยน)</div>
                )}
                <input type="file" className="form-control" onChange={e => handleImageUpload(e, imageKey)} accept="image/jpeg,image/png,image/webp" required={imageKey === 'image1' && !formData.existingImage1} />
                {formData[imageKey] && <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'green' }}>✅ เลือกรูปใหม่แล้ว</div>}
              </div>
            );
          })}
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
        <h3 style={{ marginBottom: '0.35rem', color: 'var(--primary-blue)' }}>รายการรูปตัวอย่างสินค้าทั้งหมด</h3>
        <p style={{ margin: '0 0 1rem', color: '#667085' }}>
          {visibleSampleList.length} รายการ • {visibleImageCount} รูป
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <button type="button" className={`btn ${sampleFilter === 'published' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setSampleFilter('published')} style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}>
            ใช้งานจริง ({publishedSamples.length})
          </button>
          <button type="button" className={`btn ${sampleFilter === 'pending' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setSampleFilter('pending')} style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}>
            รอตรวจสอบ ({pendingSamples.length})
          </button>
          <button type="button" className={`btn ${sampleFilter === 'all' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setSampleFilter('all')} style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}>
            ทั้งหมด ({sampleList.length})
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {visibleSampleList.map(item => {
            const itemImages = getSampleImages(item);
            const itemIsPending = isPendingSample(item);
            return (
            <div key={item.id} className="premium-card" style={{ overflow: 'hidden' }}>
              <div style={{ minHeight: '150px', backgroundColor: '#f0f0f0', position: 'relative', display: 'grid', gridTemplateColumns: itemImages.length > 1 ? 'repeat(2, 1fr)' : '1fr' }}>
                {itemImages.map(({ imageKey, src, label }) => (
                  <img key={imageKey} src={assetUrl(src)} alt={label || `${item.title} ${imageKey}`} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
                ))}
                <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex' }}>
                  <button onClick={() => handleEdit(item)} style={{ backgroundColor: 'var(--primary-blue)', color: 'white', border: 'none', padding: '0.4rem', borderRadius: '50%', cursor: 'pointer', display: 'flex', marginRight: '0.5rem' }}><Edit2 size={16} /></button>
                  <button onClick={() => onDelete(item.id)} style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '0.4rem', borderRadius: '50%', cursor: 'pointer', display: 'flex' }}><X size={16} /></button>
                </div>
              </div>
              <div style={{ padding: '1rem' }}>
                {itemIsPending && <div style={{ display: 'inline-block', marginBottom: '0.5rem', padding: '0.18rem 0.45rem', borderRadius: '999px', backgroundColor: '#fff3cd', color: '#856404', fontSize: '0.72rem', fontWeight: 'bold' }}>รอตรวจสอบ</div>}
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>{item.title || '(ไม่มีหัวข้อ)'}</h4>
                <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 'bold' }}>ซีรีส์:</span> {seriesList.find(s => s.id === item.seriesId)?.title || 'ยังไม่ระบุ'}
                  {item.modelId && <><br/><span style={{ fontWeight: 'bold' }}>รุ่น:</span> {modelsList.find(m => m.id === item.modelId)?.name}</>}
                  <br/><span style={{ fontWeight: 'bold' }}>รูป:</span> {itemImages.length} รูป
                  {item.recoveredFrom && <><br/><span style={{ fontWeight: 'bold' }}>กู้คืนจาก:</span> {item.recoveredFrom}</>}
                </div>
              </div>
            </div>
          );})}
        </div>
        {visibleSampleList.length === 0 && <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>ยังไม่มีข้อมูลรูปตัวอย่างสินค้าในมุมมองนี้</p>}
      </div>
    </div>
  );
}
