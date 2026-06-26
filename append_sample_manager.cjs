const fs = require('fs');
let content = fs.readFileSync('src/AdminPanel.jsx', 'utf8');

const sampleManagerCode = 
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
      setStatus('? ??????????????????????????????? 1 ???');
      return;
    }
    setStatus('? ?????????????????????????????????...');
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
        setStatus('? ??????????????????!');
        setFormData({ ...formData, title: '', image1: '', image2: '', image3: '', image4: '' });
        e.target.reset();
        onRefresh();
        setTimeout(() => setStatus(''), 3000);
      } else {
        setStatus('? ???????????????????????????????');
      }
    } catch (err) {
      console.error(err);
      setStatus('? ???????????????????????????????????????');
    }
  };

  return (
    <div className="admin-card">
      <h2 style={{ color: 'var(--primary-blue)', marginBottom: '1.5rem' }}>???????????????????????</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>???????????</label>
            <select className="form-control" value={formData.seriesId} onChange={e => setFormData({...formData, seriesId: e.target.value})} required>
              {seriesList.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>???????? (????????????)</label>
            <select className="form-control" value={formData.modelId} onChange={e => setFormData({...formData, modelId: e.target.value})}>
              <option value="">-- ??????? --</option>
              {modelsList.filter(m => m.seriesId === formData.seriesId).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>?????? / ?????????????</label>
          <input type="text" className="form-control" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="???? ???????????????????????????..." required />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ padding: '1rem', border: '1px dashed #ccc', borderRadius: '8px', backgroundColor: 'white' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>??????? (??????) <span style={{ color: 'red' }}>*</span></label>
            <input type="file" className="form-control" onChange={e => handleImageUpload(e, 'image1')} accept="image/*" required />
            {formData.image1 && <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'green' }}>? ????????????</div>}
          </div>
          <div style={{ padding: '1rem', border: '1px dashed #ccc', borderRadius: '8px', backgroundColor: 'white' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>???????????? 1 (?????)</label>
            <input type="file" className="form-control" onChange={e => handleImageUpload(e, 'image2')} accept="image/*" />
            {formData.image2 && <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'green' }}>? ????????????</div>}
          </div>
          <div style={{ padding: '1rem', border: '1px dashed #ccc', borderRadius: '8px', backgroundColor: 'white' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>???????????? 2 (?????)</label>
            <input type="file" className="form-control" onChange={e => handleImageUpload(e, 'image3')} accept="image/*" />
            {formData.image3 && <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'green' }}>? ????????????</div>}
          </div>
          <div style={{ padding: '1rem', border: '1px dashed #ccc', borderRadius: '8px', backgroundColor: 'white' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>???????????? 3 (?????)</label>
            <input type="file" className="form-control" onChange={e => handleImageUpload(e, 'image4')} accept="image/*" />
            {formData.image4 && <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'green' }}>? ????????????</div>}
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem', fontSize: '1rem', marginTop: '1rem' }}>???????????????????????</button>
        {status && <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: status.includes('?') ? '#d4edda' : '#f8d7da', color: status.includes('?') ? '#155724' : '#721c24', borderRadius: '8px', fontWeight: 'bold' }}>{status}</div>}
      </form>

      <div>
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary-blue)' }}>??????????????????????????????</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {sampleList.map(item => (
            <div key={item.id} className="premium-card" style={{ overflow: 'hidden' }}>
              <div style={{ height: '150px', backgroundColor: '#f0f0f0', position: 'relative' }}>
                <img src={"https://nas.goodfilmshop.com" + item.image1} alt="Main" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                  <button onClick={() => { if(window.confirm('?????????????????????????????????????')) onDelete(item.id); }} style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '0.4rem', borderRadius: '50%', cursor: 'pointer', display: 'flex' }}><X size={16} /></button>
                </div>
              </div>
              <div style={{ padding: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>{item.title}</h4>
                <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 'bold' }}>??????:</span> {seriesList.find(s => s.id === item.seriesId)?.title}
                  {item.modelId && <><br/><span style={{ fontWeight: 'bold' }}>????:</span> {modelsList.find(m => m.id === item.modelId)?.name}</>}
                </div>
              </div>
            </div>
          ))}
        </div>
        {sampleList.length === 0 && <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>???????????????????????????????</p>}
      </div>
    </div>
  );
}
\;

content = content + '\n' + sampleManagerCode;
fs.writeFileSync('src/AdminPanel.jsx', content);
console.log('Successfully appended SampleManager to AdminPanel.jsx');
