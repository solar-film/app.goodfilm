import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Share2,
  X,
  Home,
  Briefcase,
  Shield,
  GitCompare,
  Download,
  Phone,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const PRESENTATION_URL = '/assets/bostik/presentation-all-57.pdf?v=1';
const VIDEO_BASE_URL = import.meta.env.VITE_BOSTIK_VIDEO_BASE_URL
  || '/assets/bostik/videos/ppt/media';

const VIDEO_MAPPING = {
  3: { file: 'media1.mp4', label: 'BOSTIK Introduction', style: { top: '4.6%', left: '5.2%', width: '89.6%', height: '90.8%' } },
  25: { file: 'media2.mp4', label: 'Extrusion Rate', style: { top: '15.5%', left: '30%', width: '66.25%', height: '68.8%' } },
  26: { file: 'media3.mp4', label: 'Density', style: { top: '15.5%', left: '30%', width: '66.25%', height: '68.8%' } },
  27: { file: 'media4.mp4', label: 'Shore-A Hardness', style: { top: '15.5%', left: '48%', width: '48.25%', height: '68.8%' } },
  28: { file: 'media5.mp4', label: 'Tensile Strength', style: { top: '15.5%', left: '30%', width: '66.25%', height: '68.8%' } },
  29: { file: 'media6.mp4', label: 'Elongation at Break', style: { top: '15.5%', left: '30%', width: '66.25%', height: '68.8%' } },
  31: { file: 'media7.MP4', label: 'Tack-Free Time', style: { top: '15%', left: '30%', width: '66.25%', height: '70%' } },
  33: { file: 'media8.mp4', label: 'Movement Capability', style: { top: '37%', left: '5%', width: '53%', height: '58%' } },
  44: { file: 'media9.mp4', label: 'Bostik Hightack Solutions', style: { top: '10.5%', left: '10.5%', width: '80.5%', height: '80%' } },
};

const getPageWidth = (isFull = false) => {
  if (typeof window === 'undefined') return 430;
  if (isFull) {
    const aspect = 16 / 9;
    let width = window.innerHeight * aspect;
    if (width > window.innerWidth) {
      width = window.innerWidth;
    }
    return width;
  }
  return Math.min(Math.max(window.innerWidth - 32, 280), 1000);
};

export default function BostikPage() {
  const navigate = useNavigate();
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageWidth, setPageWidth] = useState(getPageWidth);
  const [activeVideo, setActiveVideo] = useState(null);
  const [documentError, setDocumentError] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [orientationNotice, setOrientationNotice] = useState('');

  useEffect(() => {
    const handleResize = () => setPageWidth(getPageWidth(isFullscreen));
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isFullscreen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
      setIsFullscreen(isFull);
      setTimeout(() => setPageWidth(getPageWidth(isFull)), 150);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (activeVideo) return;
      if (event.key === 'ArrowLeft') setCurrentPage(page => Math.max(1, page - 1));
      if (event.key === 'ArrowRight') setCurrentPage(page => Math.min(numPages || 1, page + 1));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeVideo, numPages]);

  const openMainTab = (tab, extraState = {}) => {
    navigate('/', { state: { tab, skipWelcome: true, ...extraState } });
  };

  const onDocumentLoadSuccess = ({ numPages: loadedPages }) => {
    setNumPages(loadedPages);
    setCurrentPage(page => Math.min(page, loadedPages));
    setDocumentError('');
  };

  const changePage = (nextPage) => {
    setCurrentPage(Math.min(Math.max(nextPage, 1), numPages || 1));
    setActiveVideo(null);
    document.querySelector('.bostik-presentation-viewer')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'BOSTIK: Sealing & Bonding Solutions',
          url,
        });
      } catch (err) {
        if (err?.name !== 'AbortError') console.error('Error sharing:', err);
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert('คัดลอกลิงก์เรียบร้อยแล้ว');
    }
  };

  const handleLandscapeMode = async () => {
    setOrientationNotice('');

    const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;
    const exitFullscreen = document.exitFullscreen || document.webkitExitFullscreen;

    if (fullscreenElement || isFullscreen) {
      try {
        screen.orientation?.unlock?.();
      } catch {
        // Some browsers do not allow unlocking orientation from script.
      }
      if (fullscreenElement && exitFullscreen) {
        await exitFullscreen.call(document);
      }
      setIsFullscreen(false);
      setOrientationNotice('ปิดโหมดเต็มจอแล้ว');
      setTimeout(() => setPageWidth(getPageWidth(false)), 250);
      return;
    }

    const target = document.querySelector('.bostik-presentation-fullscreen') || document.documentElement;
    const requestFullscreen = target.requestFullscreen || target.webkitRequestFullscreen;

    let nativeFS = false;
    try {
      if (requestFullscreen) {
        await requestFullscreen.call(target);
        nativeFS = true;
      }
    } catch {
      // Continue to orientation guidance even when fullscreen is unavailable.
    }

    try {
      if (screen.orientation?.lock) {
        await screen.orientation.lock('landscape');
        setOrientationNotice('เปิดเต็มจอแนวนอนแล้ว');
      } else {
        setOrientationNotice('ถ้าหน้าจอยังไม่หมุน ให้ปลดล็อกหมุนจอ แล้วหมุนเครื่องเป็นแนวนอน');
      }
    } catch {
      setOrientationNotice('ถ้าหน้าจอยังไม่หมุน ให้ปลดล็อกหมุนจอ แล้วหมุนเครื่องเป็นแนวนอน');
    }

    if (!nativeFS) {
      setIsFullscreen(true);
    }

    setTimeout(() => setPageWidth(getPageWidth(true)), 250);
  };

  const videoData = VIDEO_MAPPING[currentPage];
  const canGoBack = currentPage > 1;
  const canGoForward = Boolean(numPages && currentPage < numPages);

  return (
    <div style={{ backgroundColor: '#eef1f5', minHeight: '100vh', paddingBottom: '80px', fontFamily: 'Sarabun, sans-serif' }}>
      <div style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 100, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#333', fontSize: '0.9rem', fontWeight: 'bold', fontFamily: 'inherit', padding: '8px 0' }}>
          <ArrowLeft size={20} /> ย้อนกลับ
        </button>
        <div style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#1a4993', textAlign: 'center' }}>BOSTIK Presentation</div>
        <button onClick={handleShare} style={{ background: '#f0f4f8', border: '1px solid #dce4ec', padding: '7px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', color: '#1a4993', fontFamily: 'inherit' }}>
          <Share2 size={15} /> แชร์
        </button>
      </div>

      <div 
        className="bostik-presentation-fullscreen" 
        style={isFullscreen ? {
          backgroundColor: '#000',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        } : { backgroundColor: '#eef1f5' }}
      >
        {isFullscreen && (
          <>
            <button
              onClick={handleLandscapeMode}
              aria-label="ปิดเต็มจอ"
              style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10001, backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(4px)' }}
            >
              <X size={24} />
            </button>
            <button
               onClick={() => changePage(currentPage - 1)}
               disabled={!canGoBack}
               aria-label="สไลด์ก่อนหน้า"
               style={{ position: 'absolute', left: 'max(16px, env(safe-area-inset-left))', zIndex: 10001, backgroundColor: 'rgba(255,255,255,0.15)', color: canGoBack ? '#fff' : 'rgba(255,255,255,0.3)', border: 'none', borderRadius: '50%', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: canGoBack ? 'pointer' : 'default', backdropFilter: 'blur(4px)' }}
            >
               <ChevronLeft size={36} />
            </button>
            <button
               onClick={() => changePage(currentPage + 1)}
               disabled={!canGoForward}
               aria-label="สไลด์ถัดไป"
               style={{ position: 'absolute', right: 'max(16px, env(safe-area-inset-right))', zIndex: 10001, backgroundColor: 'rgba(255,255,255,0.15)', color: canGoForward ? '#fff' : 'rgba(255,255,255,0.3)', border: 'none', borderRadius: '50%', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: canGoForward ? 'pointer' : 'default', backdropFilter: 'blur(4px)' }}
            >
               <ChevronRight size={36} />
            </button>
          </>
        )}

      <main className="bostik-presentation-viewer" style={{ padding: isFullscreen ? 0 : '18px 16px 30px', scrollMarginTop: isFullscreen ? 0 : '72px', backgroundColor: isFullscreen ? 'transparent' : '#eef1f5', width: isFullscreen ? 'auto' : '100%', maxWidth: isFullscreen ? 'none' : '1000px', margin: '0 auto' }}>
        {!isFullscreen && (
          <>
            <div style={{ maxWidth: '1000px', margin: '0 auto 12px', display: 'flex', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={handleLandscapeMode}
                style={{
                  width: '100%',
                  maxWidth: '420px',
                  padding: '11px 14px',
                  border: '1px solid #b8d4f4',
                  borderRadius: '12px',
                  backgroundColor: '#fff',
                  color: '#1a4993',
                  fontFamily: 'inherit',
                  fontWeight: '800',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(26, 73, 147, 0.08)',
                }}
              >
                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                {isFullscreen ? 'ปิดเต็มจอ' : 'ดูแนวนอน / เต็มจอ'}
              </button>
            </div>
            {orientationNotice && (
              <div role="status" style={{ maxWidth: '1000px', margin: '0 auto 12px', padding: '9px 12px', borderRadius: '10px', backgroundColor: '#e8f1fc', color: '#1a4993', textAlign: 'center', fontSize: '0.9rem', fontWeight: '700' }}>
                {orientationNotice}
              </div>
            )}
            <div style={{ maxWidth: '1000px', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <button
                type="button"
                onClick={() => changePage(currentPage - 1)}
                disabled={!canGoBack}
                aria-label="สไลด์ก่อนหน้า"
                style={{ width: '42px', height: '42px', borderRadius: '50%', border: '1px solid #d7e0ea', backgroundColor: canGoBack ? '#fff' : '#e5e7eb', color: canGoBack ? '#1a4993' : '#9ca3af', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: canGoBack ? 'pointer' : 'default' }}
              >
                <ChevronLeft size={22} />
              </button>
              <div aria-live="polite" style={{ minWidth: '132px', textAlign: 'center', color: '#1a2b4c', fontWeight: '700', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <span>หน้า</span>
                <select
                  aria-label="เลือกหน้าสไลด์"
                  value={currentPage}
                  onChange={(event) => changePage(Number(event.target.value))}
                  disabled={!numPages}
                  style={{ padding: '5px 7px', border: '1px solid #cbd5e1', borderRadius: '7px', backgroundColor: '#fff', color: '#1a2b4c', fontFamily: 'inherit', fontWeight: '700' }}
                >
                  {Array.from({ length: numPages || 1 }, (_, index) => (
                    <option key={index + 1} value={index + 1}>{index + 1}</option>
                  ))}
                </select>
                <span>/ {numPages || '...'}</span>
              </div>
              <button
                type="button"
                onClick={() => changePage(currentPage + 1)}
                disabled={!canGoForward}
                aria-label="สไลด์ถัดไป"
                style={{ width: '42px', height: '42px', borderRadius: '50%', border: '1px solid #d7e0ea', backgroundColor: canGoForward ? '#fff' : '#e5e7eb', color: canGoForward ? '#1a4993' : '#9ca3af', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: canGoForward ? 'pointer' : 'default' }}
              >
                <ChevronRight size={22} />
              </button>
            </div>
          </>
        )}

        <Document
          file={PRESENTATION_URL}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={() => setDocumentError('ไม่สามารถโหลด BOSTIK Presentation ได้ กรุณาลองอีกครั้ง')}
          loading={<div style={{ padding: '40px', color: '#555', fontSize: '1.05rem', textAlign: 'center' }}>กำลังโหลดเอกสาร PDF...</div>}
          error={<div style={{ padding: '30px', color: '#b42318', textAlign: 'center' }}>{documentError || 'ไม่สามารถโหลดเอกสาร PDF ได้'}</div>}
        >
          <div style={{ position: 'relative', width: pageWidth, maxWidth: '100%', margin: '0 auto', boxShadow: '0 5px 18px rgba(0,0,0,0.15)', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#fff', aspectRatio: '16 / 9' }}>
            <Page
              key={`page-${currentPage}-${pageWidth}`}
              pageNumber={currentPage}
              width={pageWidth}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              loading={<div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#667085' }}>กำลังโหลดหน้าที่ {currentPage}...</div>}
            />

            {videoData && (
              <button
                type="button"
                onClick={() => setActiveVideo(videoData)}
                aria-label={`เล่นวิดีโอ ${videoData.label}`}
                title={`เล่นวิดีโอ ${videoData.label}`}
                style={{
                  position: 'absolute',
                  ...videoData.style,
                  cursor: 'pointer',
                  zIndex: 10,
                  padding: 0,
                  background: 'transparent',
                  border: 0,
                  borderRadius: 0,
                  boxShadow: 'none',
                  appearance: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'inherit',
                }}
              >
                <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span style={{ width: '58px', height: '58px', borderRadius: '50%', backgroundColor: '#1a4993', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 18px rgba(26,73,147,0.22)' }}>
                    <PlayCircle size={34} />
                  </span>
                  <span style={{ padding: '6px 12px', borderRadius: '999px', backgroundColor: '#1a4993', color: '#fff', fontSize: '0.82rem', fontWeight: '800', lineHeight: 1, whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(26,73,147,0.2)' }}>
                    กดดู VDO
                  </span>
                </span>
              </button>
            )}
          </div>
        </Document>

        {!isFullscreen && (
          <div style={{ maxWidth: '1000px', margin: '14px auto 0', display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
            <button type="button" disabled={!canGoBack} onClick={() => changePage(currentPage - 1)} style={{ flex: 1, maxWidth: '180px', padding: '10px 14px', border: '1px solid #d7e0ea', borderRadius: '10px', backgroundColor: canGoBack ? '#fff' : '#e5e7eb', color: canGoBack ? '#1a4993' : '#9ca3af', fontFamily: 'inherit', fontWeight: '700', cursor: canGoBack ? 'pointer' : 'default' }}>หน้าก่อนหน้า</button>
            <button type="button" disabled={!canGoForward} onClick={() => changePage(currentPage + 1)} style={{ flex: 1, maxWidth: '180px', padding: '10px 14px', border: '1px solid #d7e0ea', borderRadius: '10px', backgroundColor: canGoForward ? '#1a4993' : '#e5e7eb', color: canGoForward ? '#fff' : '#9ca3af', fontFamily: 'inherit', fontWeight: '700', cursor: canGoForward ? 'pointer' : 'default' }}>หน้าถัดไป</button>
          </div>
        )}
      </main>

      {activeVideo && (
        <div role="dialog" aria-modal="true" aria-label={activeVideo.label} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 10000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <button type="button" aria-label="ปิดวิดีโอ" onClick={() => setActiveVideo(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '10px', borderRadius: '50%', cursor: 'pointer', display: 'flex' }}>
            <X size={24} />
          </button>
          <h2 style={{ color: 'white', marginBottom: '18px', fontSize: '1.3rem', textAlign: 'center' }}>{activeVideo.label}</h2>
          <video
            key={activeVideo.file}
            src={`${VIDEO_BASE_URL}/${activeVideo.file}`}
            controls
            controlsList="nodownload"
            preload="metadata"
            playsInline
            style={{ width: '100%', maxWidth: '1000px', maxHeight: '72vh', borderRadius: '8px', backgroundColor: '#000', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
          />
        </div>
      )}
      </div>

      <nav className="bottom-nav">
        <div className="nav-item" onClick={() => openMainTab('home')}>
          <Home size={24} />
          <span style={{ fontSize: '0.65rem', marginTop: '4px' }}>หน้าหลัก</span>
        </div>
        <div className="nav-item" onClick={() => openMainTab('works')}>
          <Briefcase size={24} />
          <span style={{ fontSize: '0.65rem', marginTop: '4px' }}>ฟิล์ม 3M</span>
        </div>
        <div className="nav-item" onClick={() => openMainTab('home', { showCompare: true })}>
          <GitCompare size={24} />
          <span style={{ fontSize: '0.65rem', marginTop: '4px' }}>เทียบสเปค</span>
        </div>
        <div className="nav-item active" onClick={() => openMainTab('bostik')}>
          <Shield size={24} />
          <span style={{ fontSize: '0.65rem', marginTop: '4px' }}>Bostik</span>
        </div>
        <div className="nav-item" onClick={() => openMainTab('download')}>
          <Download size={24} />
          <span style={{ fontSize: '0.65rem', marginTop: '4px' }}>แคตตาล็อก</span>
        </div>
        <div className="nav-item" onClick={() => openMainTab('contact')}>
          <Phone size={24} />
          <span style={{ fontSize: '0.65rem', marginTop: '4px' }}>ติดต่อ</span>
        </div>
      </nav>
    </div>
  );
}
