const fs = require('fs');
let code = fs.readFileSync('src/AdminPanel.jsx', 'utf8');

const newCode = `// --- PORTFOLIO MANAGER ---
function PortfolioManager({ seriesList, modelsList, portfolioList, onRefresh, onDelete }) {
  const [formData, setFormData] = useState({
    id: '', title: '', seriesId: '', modelId: '', beforeImage: '', afterImage: '', 
    image1: '', image2: '', image3: '', image4: '',
    beforeLabel: 'กระจกใส (ก่อนติด)', afterLabel: 'หลังติดฟิล์ม'
  });
  const [status, setStatus] = useState('');
  
  const [filterSeries, setFilterSeries] = useState('');
  const [filterModel, setFilterModel] = useState('');

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
    if (!formData.seriesId) {
      setStatus('❌ กรุณาเลือกรุ่นฟิล์ม 3M');
      return;
    }
    setStatus('กำลังอัปโหลดรูปภาพ...');
    try {
      const uploadImage = async (imgBlob, prefix) => {
        if (!(imgBlob instanceof Blob)) return imgBlob;
        const formDataObj = new FormData();
        formDataObj.append('file', imgBlob, prefix + '.jpg');
        const res = await fetch('https://nas.goodfilmshop.com/upload-portfolio', { method: 'POST', body: formDataObj });
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
        id: formData.id || Date.now().toString(),
        beforeImage: beforeUrl || formData.beforeImage,
        afterImage: afterUrl || formData.afterImage,
        image1: img1Url || formData.image1,
        image2: img2Url || formData.image2,
        image3: img3Url || formData.image3,
        image4: img4Url || formData.image4
      };

      const isEdit = !!formData.id;
      const url = isEdit ? 'https://nas.goodfilmshop.com/portfolio/' + formData.id : 'https://nas.goodfilmshop.com/portfolio';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setStatus(isEdit ? '✅ แก้ไขสำเร็จ!' : '✅ บันทึกสำเร็จ!');
        setFormData({ id: '', title: '', seriesId: '', modelId: '', beforeImage: '', afterImage: '', image1: '', image2: '', image3: '', image4: '', beforeLabel: 'กระจกใส (ก่อนติด)', afterLabel: 'หลังติดฟิล์ม' });
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

  const handleEdit = (item) => {
    setFormData({
      ...item,
      beforeLabel: item.beforeLabel || 'กระจกใส (ก่อนติด)',
      afterLabel: item.afterLabel || 'หลังติดฟิล์ม',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Processing portfolio list
  let processedList = [...portfolioList];
  
  if (filterSeries) {
    processedList = processedList.filter(p => p.seriesId === filterSeries);
  }
  if (filterModel) {
    processedList = processedList.filter(p => p.modelId === filterModel);
  }
  
  processedList.sort((a, b) => {
    const sA = a.seriesId || '';
    const sB = b.seriesId || '';
    if (sA !== sB) return sA.localeCompare(sB);
    const mA = a.modelId || '';
    const mB = b.modelId || '';
    return mA.localeCompare(mB);
  });

  const getFullUrl = (url) => url ? (url.startsWith('http') ? url : 'https://nas.goodfilmshop.com' + url) : '';

  return (
    <div className="admin-grid" style={{ gridTemplateColumns: '1fr', gap: '2rem' }}>
      <div className="premium-card" style={{ padding: '1.5rem', alignSelf: 'start', top: '20px' }}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary-blue)' }}>{formData.id ? 'แก้ไขผลงาน' : 'เพิ่มผลงานใหม่'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>เลือกรุ่นฟิล์ม 3M</label>
              <select name="seriesId" value={formData.seriesId} onChange={(e) => setFormData({...formData, seriesId: e.target.value, modelId: ''})} className="form-control" style={{fontSize: '0.85rem', padding: '0.5rem'}} required>
                <option value="">-- เลือกรุ่นฟิล์ม --</option>
                {seriesList.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>เลือก Model</label>
              <select name="modelId" value={formData.modelId} onChange={(e) => setFormData({...formData, modelId: e.target.value})} className="form-control" style={{fontSize: '0.85rem', padding: '0.5rem'}}>
                <option value="">-- เลือก Model --</option>
                {modelsList.filter(m => m.seriesId === formData.seriesId).map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>หัวข้อผลงาน</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required className="form-control" style={{fontSize: '0.85rem', padding: '0.5rem'}} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.85rem' }}>ภาพก่อนติด</label>
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'beforeImage')} required={!formData.id && !formData.beforeImage} className="form-control" style={{fontSize: '0.75rem', padding: '0.4rem'}} />
              {formData.id && formData.beforeImage && !(formData.beforeImage instanceof Blob) && <div style={{marginTop: '0.2rem', fontSize: '0.75rem', color: 'green'}}>มีรูปปัจจุบันแล้ว</div>}
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.85rem' }}>ภาพหลังติด</label>
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'afterImage')} required={!formData.id && !formData.afterImage} className="form-control" style={{fontSize: '0.75rem', padding: '0.4rem'}} />
              {formData.id && formData.afterImage && !(formData.afterImage instanceof Blob) && <div style={{marginTop: '0.2rem', fontSize: '0.75rem', color: 'green'}}>มีรูปปัจจุบันแล้ว</div>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.8rem' }}>คำบรรยาย (ก่อนติด)</label>
              <input type="text" value={formData.beforeLabel} onChange={(e) => setFormData({...formData, beforeLabel: e.target.value})} required className="form-control" style={{fontSize: '0.8rem', padding: '0.4rem'}} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.8rem' }}>คำบรรยาย (หลังติด)</label>
              <input type="text" value={formData.afterLabel} onChange={(e) => setFormData({...formData, afterLabel: e.target.value})} required className="form-control" style={{fontSize: '0.8rem', padding: '0.4rem'}} />
            </div>
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.85rem' }}>รูปอื่นๆ เพิ่มเติม (สูงสุด 4 รูป)</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
              <div>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'image1')} className="form-control" style={{fontSize: '0.75rem', padding: '0.4rem'}} />
                {formData.id && formData.image1 && !(formData.image1 instanceof Blob) && <div style={{fontSize: '0.75rem', color: 'green'}}>มีรูปแล้ว</div>}
              </div>
              <div>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'image2')} className="form-control" style={{fontSize: '0.75rem', padding: '0.4rem'}} />
                {formData.id && formData.image2 && !(formData.image2 instanceof Blob) && <div style={{fontSize: '0.75rem', color: 'green'}}>มีรูปแล้ว</div>}
              </div>
              <div>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'image3')} className="form-control" style={{fontSize: '0.75rem', padding: '0.4rem'}} />
                {formData.id && formData.image3 && !(formData.image3 instanceof Blob) && <div style={{fontSize: '0.75rem', color: 'green'}}>มีรูปแล้ว</div>}
              </div>
              <div>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'image4')} className="form-control" style={{fontSize: '0.75rem', padding: '0.4rem'}} />
                {formData.id && formData.image4 && !(formData.image4 instanceof Blob) && <div style={{fontSize: '0.75rem', color: 'green'}}>มีรูปแล้ว</div>}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn btn-primary" style={{flex: 1}}>{formData.id ? 'บันทึกการแก้ไข' : 'บันทึกผลงาน'}</button>
            {formData.id && <button type="button" onClick={() => { setFormData({ id: '', title: '', seriesId: '', modelId: '', beforeImage: '', afterImage: '', image1: '', image2: '', image3: '', image4: '', beforeLabel: 'กระจกใส (ก่อนติด)', afterLabel: 'หลังติดฟิล์ม' }); document.querySelector('form').reset(); }} className="btn btn-outline" style={{flex: 1, borderColor: '#ccc'}}>ยกเลิก</button>}
          </div>
          {status && <div style={{ textAlign: 'center', color: status.includes('✅') ? 'green' : 'red', fontWeight: 'bold' }}>{status}</div>}
        </form>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ margin: 0, color: 'var(--primary-blue)' }}>รายการผลงานทั้งหมด ({processedList.length})</h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <select value={filterSeries} onChange={(e) => { setFilterSeries(e.target.value); setFilterModel(''); }} className="form-control" style={{ width: 'auto', display: 'inline-block', padding: '0.4rem 2rem 0.4rem 0.8rem', fontSize: '0.85rem' }}>
              <option value="">-- กรองตามรุ่นฟิล์ม --</option>
              {seriesList.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <select value={filterModel} onChange={(e) => setFilterModel(e.target.value)} className="form-control" style={{ width: 'auto', display: 'inline-block', padding: '0.4rem 2rem 0.4rem 0.8rem', fontSize: '0.85rem' }} disabled={!filterSeries}>
              <option value="">-- กรองตาม Model --</option>
              {modelsList.filter(m => m.seriesId === filterSeries).map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        {processedList.map(item => (
          <div key={item.id} className="premium-card" style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ fontWeight: '600', fontSize: '0.85rem', lineHeight: '1.3' }}>{item.title}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {seriesList.find(s=>s.id===item.seriesId)?.title || item.seriesId} <br/>
              Model: {modelsList.find(m=>m.id===item.modelId)?.name || item.modelId || '-'}
            </div>
            <div style={{ display: 'flex', gap: '0.3rem', height: '60px' }}>
              <img src={getFullUrl(item.beforeImage)} alt="before" style={{ width: '50%', objectFit: 'cover', borderRadius: '4px' }} />
              <img src={getFullUrl(item.afterImage)} alt="after" style={{ width: '50%', objectFit: 'cover', borderRadius: '4px' }} />
            </div>
            {(item.image1 || item.image2 || item.image3 || item.image4) && (
              <div style={{ display: 'flex', gap: '0.2rem', height: '30px' }}>
                {item.image1 && <img src={getFullUrl(item.image1)} alt="img1" style={{ flex: 1, width: '25%', objectFit: 'cover', borderRadius: '2px' }} />}
                {item.image2 && <img src={getFullUrl(item.image2)} alt="img2" style={{ flex: 1, width: '25%', objectFit: 'cover', borderRadius: '2px' }} />}
                {item.image3 && <img src={getFullUrl(item.image3)} alt="img3" style={{ flex: 1, width: '25%', objectFit: 'cover', borderRadius: '2px' }} />}
                {item.image4 && <img src={getFullUrl(item.image4)} alt="img4" style={{ flex: 1, width: '25%', objectFit: 'cover', borderRadius: '2px' }} />}
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.3rem', marginTop: 'auto' }}>
              <button type="button" onClick={() => handleEdit(item)} className="btn btn-outline" style={{ flex: 1, borderColor: 'var(--primary-blue)', color: 'var(--primary-blue)', padding: '0.3rem', fontSize: '0.75rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                แก้ไข
              </button>
              <button type="button" onClick={() => { if(window.confirm('ยืนยันการลบผลงานนี้?')) onDelete(item.id) }} className="btn btn-outline" style={{ flex: 1, borderColor: 'red', color: 'red', padding: '0.3rem', fontSize: '0.75rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                ลบ
              </button>
            </div>
          </div>
        ))}
        </div>
        {processedList.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#888', gridColumn: '1 / -1' }}>
            ไม่พบผลงานที่ตรงกับเงื่อนไขการกรอง
          </div>
        )}
      </div>
    </div>
  );
}
\`;

const startIndex = code.indexOf('// --- PORTFOLIO MANAGER ---');
const endIndex = code.indexOf('// --- CATALOG MANAGER ---');

if (startIndex !== -1 && endIndex !== -1) {
  code = code.substring(0, startIndex) + newCode + code.substring(endIndex);
  fs.writeFileSync('src/AdminPanel.jsx', code, 'utf8');
  console.log('Successfully patched AdminPanel.jsx');
} else {
  console.log('Could not find markers');
}
