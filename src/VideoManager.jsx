import { useState } from 'react';
import { adminFetch } from './apiConfig';
import { Edit2, X, PlayCircle } from 'lucide-react';

function VideoManager({ seriesList, videosList, onRefresh, onDelete }) {
  const [formData, setFormData] = useState({ title: '', youtubeUrl: '', seriesId: '' });
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const getPlayCircleEmbedId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = String(url).match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleEdit = (video) => {
    setEditingId(video.id);
    setFormData({
      title: video.title,
      youtubeUrl: `https://www.youtube.com/watch?v=${video.youtubeId}`,
      seriesId: video.seriesId || ''
    });
    setStatus('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ title: '', youtubeUrl: '', seriesId: '' });
    setStatus('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus('');

    const youtubeId = getPlayCircleEmbedId(formData.youtubeUrl);
    if (!youtubeId) {
      setStatus('รูปแบบลิงก์ YouTube ไม่ถูกต้อง');
      setSubmitting(false);
      return;
    }

    const payload = {
      id: editingId || Date.now().toString(),
      title: formData.title.trim(),
      youtubeId,
      seriesId: formData.seriesId || ''
    };

    try {
      const res = await adminFetch(editingId ? `/videos/${editingId}` : '/videos', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Save failed');

      setStatus('✅ บันทึกข้อมูลวิดีโอเรียบร้อยแล้ว');
      cancelEdit();
      onRefresh();
    } catch (err) {
      console.error(err);
      setStatus('เกิดข้อผิดพลาดในการบันทึก กรุณาลองใหม่');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="premium-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PlayCircle size={24} color="#ff0000" />
          {editingId ? 'แก้ไขวิดีโอ' : 'เพิ่มวิดีโอ YouTube ใหม่'}
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>ชื่อวิดีโอ / คำบรรยาย <span style={{ color: 'red' }}>*</span></label>
            <input type="text" className="form-control" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="เช่น รีวิวฟิล์ม..." />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>ลิงก์ YouTube URL <span style={{ color: 'red' }}>*</span></label>
            <input type="url" className="form-control" required value={formData.youtubeUrl} onChange={e => setFormData({ ...formData, youtubeUrl: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>แสดงในหน้ารายละเอียดรุ่นฟิล์ม <span style={{ color: 'red' }}>*</span></label>
            <select className="form-control" required value={formData.seriesId} onChange={e => setFormData({ ...formData, seriesId: e.target.value })}>
              <option value="" disabled>-- เลือกซีรีส์ฟิล์ม --</option>
              {seriesList.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'กำลังบันทึก...' : (editingId ? 'บันทึกการแก้ไข' : 'เพิ่มวิดีโอ')}
          </button>
          {editingId && (
            <button type="button" className="btn btn-outline" onClick={cancelEdit}>
              ยกเลิก
            </button>
          )}
        </div>
        {status && <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: status.includes('✅') ? '#d4edda' : '#f8d7da', color: status.includes('✅') ? '#155724' : '#721c24', borderRadius: '8px', fontWeight: 'bold' }}>{status}</div>}
      </form>

      <div>
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary-blue)' }}>รายการวิดีโอทั้งหมด ({videosList.length})</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {videosList.map(video => (
            <div key={video.id} className="premium-card" style={{ overflow: 'hidden' }}>
              <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', backgroundColor: '#000' }}>
                <iframe
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                  src={`https://www.youtube.com/embed/${video.youtubeId}?origin=${window.location.origin}`}
                  title={video.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                ></iframe>
              </div>
              <div style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', flex: 1 }}>{video.title}</h4>
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    <button onClick={() => handleEdit(video)} style={{ backgroundColor: 'var(--primary-blue)', color: 'white', border: 'none', padding: '0.3rem', borderRadius: '4px', cursor: 'pointer' }}><Edit2 size={14} /></button>
                    <button onClick={() => {
                      if (window.confirm('คุณต้องการลบวิดีโอนี้ใช่หรือไม่?')) {
                        onDelete(video.id);
                      }
                    }} style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '0.3rem', borderRadius: '4px', cursor: 'pointer' }}><X size={14} /></button>
                  </div>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                  <span style={{ fontWeight: 'bold' }}>แสดงที่รุ่น:</span> {seriesList.find(s => s.id === video.seriesId)?.title || 'ไม่ระบุ'}
                </div>
              </div>
            </div>
          ))}
        </div>
        {videosList.length === 0 && <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>ยังไม่มีข้อมูลวิดีโอ</p>}
      </div>
    </div>
  );
}

export default VideoManager;
