import { useState, useRef, useEffect } from 'react';
import { Search, Home, Briefcase, Heart, User, Building2, Store, ChevronRight, Share2, Download, ChevronLeft, ArrowLeft, FileText, Shield, Sun, Image, Phone, GitCompare, BookOpen, Columns, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './App.css';

const BeforeAfterSlider = ({ beforeImage, afterImage, beforeLabel, afterLabel }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = (clientX) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percent);
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    const handleMouseMove = (e) => handleMove(e.clientX);
    const handleTouchMove = (e) => handleMove(e.touches[0].clientX);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div 
      ref={containerRef}
      className="slider-container"
      onMouseDown={(e) => { setIsDragging(true); handleMove(e.clientX); }}
      onTouchStart={(e) => { setIsDragging(true); handleMove(e.touches[0].clientX); }}
      style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden', borderRadius: '12px', cursor: 'ew-resize', backgroundColor: '#e0e0e0' }}
    >
      <img src={afterImage} alt="After" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} draggable="false" />
      <div className="slider-label" style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', zIndex: 2, fontWeight: '500', opacity: sliderPosition > 75 ? 0 : 1, transition: 'opacity 0.2s ease', pointerEvents: 'none' }}>{afterLabel || 'หลังติดฟิล์ม'}</div>
      
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`, zIndex: 5 }}>
        <img src={beforeImage} alt="Before" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} draggable="false" />
        <div className="slider-label" style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', zIndex: 10, fontWeight: '500', opacity: sliderPosition < 25 ? 0 : 1, transition: 'opacity 0.2s ease', pointerEvents: 'none' }}>{beforeLabel || 'ก่อนติดฟิล์ม'}</div>
      </div>

      <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${sliderPosition}%`, width: '3px', backgroundColor: 'white', transform: 'translateX(-50%)', zIndex: 20, boxShadow: '0 0 10px rgba(0,0,0,0.3)' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '36px', height: '36px', backgroundColor: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
          <div style={{ display: 'flex', gap: '3px' }}>
            <div style={{ width: '2px', height: '12px', backgroundColor: 'var(--primary-blue)' }}></div>
            <div style={{ width: '2px', height: '12px', backgroundColor: 'var(--primary-blue)' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BannerCarousel = ({ bannersList, navigate, getFullUrl }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (bannersList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bannersList.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [bannersList.length]);

  if (!bannersList || bannersList.length === 0) {
    return <div className="hero-banner" style={{ borderRadius: '16px' }}></div>; // Fallback
  }

  const handleBannerClick = (url) => {
    if (!url) return;
    if (url.startsWith('http')) {
      window.open(url, '_blank');
    } else {
      window.location.href = url;
    }
  };

  return (
    <div className="banner-carousel-container" style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden', borderRadius: '16px', boxShadow: 'var(--shadow-soft)' }}>
      {bannersList.map((banner, index) => (
        <img 
          key={banner.id}
          src={getFullUrl(banner.imageUrl)} 
          alt="Banner" 
          onClick={() => handleBannerClick(banner.linkUrl)}
          style={{ 
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover',
            opacity: index === currentIndex ? 1 : 0, transition: 'opacity 0.8s ease-in-out', cursor: banner.linkUrl ? 'pointer' : 'default'
          }} 
        />
      ))}
      {bannersList.length > 1 && (
        <div style={{ position: 'absolute', bottom: '15px', left: 0, width: '100%', display: 'flex', justifyContent: 'center', gap: '8px', zIndex: 10 }}>
          {bannersList.map((_, index) => (
            <div 
              key={index} 
              onClick={() => setCurrentIndex(index)}
              style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: index === currentIndex ? 'white' : 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'background-color 0.3s' }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const SectionHeader = ({ icon: Icon, title, subtitle }) => {
  return (
    <div style={{ marginBottom: '1.5rem', marginTop: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        
        {/* Rounded Square Badge with shadow */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          width: '42px', 
          height: '42px', 
          backgroundColor: 'var(--primary-blue)', 
          borderRadius: '10px', 
          flexShrink: 0,
          boxShadow: '0 3px 10px rgba(0, 45, 114, 0.2)'
        }}>
          <Icon size={20} color="white" strokeWidth={2} />
        </div>

        {/* Decorative Diagonal Slashes */}
        <svg width="12" height="28" viewBox="0 0 12 28" style={{ flexShrink: 0, opacity: 0.2 }}>
          <line x1="3" y1="25" x2="6" y2="3" stroke="var(--primary-blue)" strokeWidth="2" strokeLinecap="round" />
          <line x1="7" y1="25" x2="10" y2="3" stroke="var(--primary-blue)" strokeWidth="2" strokeLinecap="round" />
        </svg>

        {/* Title + Red Underline */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ 
            color: 'var(--primary-blue)', 
            fontSize: '1.4rem', 
            fontWeight: '900', 
            margin: 0,
            lineHeight: 1.15,
            letterSpacing: '0.05em',
            fontFamily: "'Noto Sans Thai', 'Inter', sans-serif"
          }}>
            {title}
          </h3>
          <div style={{ 
            width: '80px', 
            height: '4px', 
            backgroundColor: 'var(--primary-red)',
            borderRadius: '2px',
            marginTop: '6px'
          }}></div>
        </div>

      </div>
      
      {/* Subtitle */}
      {subtitle && (
        <div style={{ marginTop: '0.6rem', paddingLeft: '0px' }}>
          {typeof subtitle === 'string' ? (
            <p style={{ color: '#666', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>{subtitle}</p>
          ) : subtitle}
        </div>
      )}
    </div>
  );
};

function MainApp() {
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(true);
  const [groups, setGroups] = useState([]);
  const [series, setSeries] = useState([]);
  const [models, setModels] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [downloadsList, setDownloadsList] = useState([]);
  const [bannersList, setBannersList] = useState([]);
  
  const [currentTab, setCurrentTab] = useState('home'); // home, works, search, fav, profile
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [activeGroupId, setActiveGroupId] = useState('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedHomeGroupId, setExpandedHomeGroupId] = useState(null);
  const [expandedSeriesId, setExpandedSeriesId] = useState(null);
  const [loadState, setLoadState] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [downloadFilter, setDownloadFilter] = useState('all');
  const [downloadSearchQuery, setDownloadSearchQuery] = useState('');
  const [expandedImage, setExpandedImage] = useState(null);
  const [expandedImageFile, setExpandedImageFile] = useState(null);
  const [pdfActionModal, setPdfActionModal] = useState({ isOpen: false, url: '', filename: '', file: null, loading: false });
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  useEffect(() => {
    if (expandedImage) {
      fetch(expandedImage)
        .then(res => res.blob())
        .then(blob => {
          const filename = expandedImage.split('/').pop() || 'image.png';
          setExpandedImageFile(new File([blob], filename, { type: blob.type || 'image/png' }));
        })
        .catch(console.error);
    } else {
      setExpandedImageFile(null);
    }
  }, [expandedImage]);

  useEffect(() => {
    if (pdfActionModal.isOpen && pdfActionModal.url && !pdfActionModal.file) {
      fetch(pdfActionModal.url)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], pdfActionModal.filename, { type: blob.type || 'application/pdf' });
          const blobUrl = window.URL.createObjectURL(file);
          setPdfActionModal(prev => ({ ...prev, loading: false, file, blobUrl }));
        })
        .catch(error => {
          console.error(error);
          setPdfActionModal(prev => ({ ...prev, loading: false, error: 'Failed to prepare file' }));
        });
    }
  }, [pdfActionModal.isOpen, pdfActionModal.url]);

  const [downloadPasswordPrompt, setDownloadPasswordPrompt] = useState({ isOpen: false, doc: null, password: '', error: '' });
  const [compareList, setCompareList] = useState([]);

  // Mobile browsers often render only the first page of a blob PDF inside an iframe.
  // Open the original PDF URL in the device viewer instead, without modifying the file.
  const handleForceDownload = async (e, url, filename, forceBypassPreview = false) => {
    e?.preventDefault();
    
    // If it's an image, preview it directly in the app instead of downloading
    if (!forceBypassPreview && url.match(/\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i)) {
      setExpandedImage(url);
      return;
    }

    if (isMobile && /\.pdf(?:[?#]|$)/i.test(url)) {
      const link = document.createElement('a');
      link.href = getFullUrl(url);
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // For PDFs and other files, open the action modal to fetch and share synchronously
    setPdfActionModal({ isOpen: true, url, filename: filename || url.split('/').pop() || 'document', loading: true, file: null });
  };

  const [showCompareModal, setShowCompareModal] = useState(false);
  const [isCompareDropdownOpen, setIsCompareDropdownOpen] = useState(false);

  const handleToggleCompare = (model) => {
    setCompareList(prev => {
      const isSelected = prev.some(m => m.id === model.id);
      if (isSelected) {
        return prev.filter(m => m.id !== model.id);
      } else {
        if (prev.length >= 3) {
          alert('สามารถเลือกเปรียบเทียบได้สูงสุด 3 รุ่นครับ');
          return prev;
        }
        return [...prev, model];
      }
    });
  };

  const getFullUrl = (path) => {
    if (!path) return path;
    if (path.startsWith('/')) {
      return `https://nas.goodfilmshop.com${path}`;
    }
    return path;
  };

  const loadData = () => {
    setLoadState('loading');
    const API_URL = `https://nas.goodfilmshop.com`;
    const ts = Date.now();
    Promise.all([
      fetch(`${API_URL}/groups?_=${ts}`).then(res => { if (!res.ok) throw new Error('groups'); return res.json(); }),
      fetch(`${API_URL}/series?_=${ts}`).then(res => { if (!res.ok) throw new Error('series'); return res.json(); }),
      fetch(`${API_URL}/models?_=${ts}`).then(res => { if (!res.ok) throw new Error('models'); return res.json(); }),
      fetch(`${API_URL}/portfolio?_=${ts}`).then(res => { if (!res.ok) throw new Error('portfolio'); return res.json(); }),
      fetch(`${API_URL}/downloads?_=${ts}`).then(res => { if (!res.ok) throw new Error('downloads'); return res.json(); }),
      fetch(`${API_URL}/banners?_=${ts}`).then(res => { if (!res.ok) throw new Error('banners'); return res.json(); }),
    ])
      .then(([g, s, m, p, d, b]) => {
        setGroups(g);
        setSeries(s);
        setModels(m.sort((a, b) => {
          if (a.name === 'P18ARL') return -1;
          if (b.name === 'P18ARL') return 1;
          const numA = parseInt(a.name.match(/\d+/)?.[0] || 0);
          const numB = parseInt(b.name.match(/\d+/)?.[0] || 0);
          return numA - numB;
        }));
        setPortfolio(p);
        setDownloadsList(d);
        setBannersList(b || []);
        setLoadState('ready');
        
        const urlParams = new URLSearchParams(window.location.search);
        const sharedSeriesId = urlParams.get('series');
        if (sharedSeriesId) {
          const found = s.find(seriesItem => seriesItem.id === sharedSeriesId);
          if (found) {
            setSelectedSeries(found);
            setShowWelcome(false);
          }
        }
      })
      .catch((e) => {
        console.error('โหลดข้อมูลไม่สำเร็จ:', e);
        setLoadState('error');
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const getGroupIcon = (groupId) => {
    switch (groupId) {
      case 'g1': return <Building2 size={28} />; // อาคาร
      case 'g2': return <Shield size={28} />; // นิรภัย
      case 'g3': return <Sun size={28} />; // ตกแต่ง
      default: return <Store size={28} />;
    }
  };

  const renderHome = () => (
    <div className="mobile-view" style={{ backgroundColor: '#fafafa', minHeight: '100vh', paddingBottom: '80px' }}>
      <div className="desktop-home-layout">
        <div className="desktop-home-left">
          <BannerCarousel bannersList={bannersList} navigate={navigate} getFullUrl={getFullUrl} />
        </div>
        <div className="desktop-home-right">
          <div className="home-content-light" style={{ marginTop: '0', paddingTop: '1rem' }}>
        {/* Search Bar */}
        <div className="search-bar-container">
          <input type="text" placeholder="ค้นหาผลงาน, รุ่นฟิล์ม, ประเภทอาคาร" className="search-input" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <Search size={20} color="#A0A0A0" />
        </div>
        {/* Product Groups (Accordion) */}
        <div className="product-groups">

        {loadState === 'loading' && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <div className="gfs-spinner" style={{ width: '36px', height: '36px', border: '3px solid #e0e0e0', borderTopColor: 'var(--primary-blue)', borderRadius: '50%', margin: '0 auto 1rem', animation: 'gfsSpin 0.8s linear infinite' }} />
            <p style={{ fontSize: '1rem' }}>กำลังโหลดข้อมูล...</p>
          </div>
        )}

        {loadState === 'error' && (
          <div style={{ textAlign: 'center', padding: '2.5rem 1.5rem', backgroundColor: '#fff5f5', border: '1px solid #ffd6d6', borderRadius: '12px' }}>
            <p style={{ fontSize: '1.1rem', color: 'var(--primary-red)', fontWeight: 'bold', marginBottom: '0.5rem' }}>โหลดข้อมูลไม่สำเร็จ</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1.2rem' }}>
              ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ข้อมูลได้<br />
              กรุณาตรวจสอบว่าได้เปิดเซิร์ฟเวอร์ (npm run server) แล้ว
            </p>
            <button
              onClick={loadData}
              style={{ padding: '0.7rem 1.8rem', backgroundColor: 'var(--primary-blue)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}
            >
              ลองอีกครั้ง
            </button>
          </div>
        )}

        {loadState === 'ready' && (
        <div className="groups-accordion" style={{ padding: '1rem 0' }}>
          {[
            { id: '3m', title: 'กลุ่มผลิตภัณฑ์ฟิล์ม 3M', filter: g => !['g6', 'g7', 'g8'].includes(g.id) },
            { id: 'bostik', title: 'ผลิตภัณฑ์ Bostik', filter: g => ['g6', 'g7', 'g8'].includes(g.id) }
          ].map(section => (
            <div key={section.id}>
              {searchQuery === '' && groups.filter(section.filter).length > 0 && (
                <div className="section-title" style={{ marginTop: section.id === 'bostik' ? '2.5rem' : '0', marginBottom: '1.2rem' }}>
                  <h2 style={{ fontSize: '1.35rem', color: 'var(--primary-blue)', fontWeight: 'bold' }}>{section.title}</h2>
                </div>
              )}
              {groups.filter(section.filter).map((group) => {
                const searchLower = searchQuery.toLowerCase();
            const groupSeries = series.filter(s => s.groupId === group.id && (
              searchQuery === '' || 
              s.title.toLowerCase().includes(searchLower) || 
              s.desc.toLowerCase().includes(searchLower) ||
              models.some(m => m.seriesId === s.id && m.name.toLowerCase().includes(searchLower))
            ));
            if (searchQuery !== '' && groupSeries.length === 0 && !group.title.toLowerCase().includes(searchLower)) return null;
            const isExpanded = searchQuery !== '' || expandedHomeGroupId === group.id;
            
            return (
              <div key={group.id} className="group-accordion-item" style={{ marginBottom: '0.6rem', backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-soft)', border: '1px solid var(--border-color)' }}>
                {/* Group Header */}
                <div 
                  onClick={() => setExpandedHomeGroupId(isExpanded ? null : group.id)}
                  style={{ padding: '0.9rem 1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: isExpanded ? 'var(--light-blue)' : 'white' }}
                >
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--primary-blue)', fontWeight: 'bold', margin: 0 }}>{group.title}</h3>
                  <div style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}>
                    <ChevronRight size={24} color="var(--primary-blue)" />
                  </div>
                </div>
                
                {/* Expanded Content (Series List) */}
                <div className={`accordion-content ${isExpanded ? 'expanded' : ''}`}>
                  <div className="accordion-inner">
                    <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', borderTop: isExpanded ? '1px solid rgba(0,0,0,0.05)' : 'none' }}>
                      {groupSeries.length > 0 ? (
                        <div className="series-list" style={{ marginTop: '1rem' }}>
                          {groupSeries.map((s) => {
                            const isSeriesExpanded = expandedSeriesId === s.id;
                            const seriesModels = models.filter(m => m.seriesId === s.id);
                            
                            return (
                              <div key={s.id} style={{ marginBottom: '0.6rem', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#f8f9fa' }}>
                                <div 
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    if (seriesModels.length === 0) {
                                      setSelectedSeries(s);
                                    } else {
                                      setExpandedSeriesId(isSeriesExpanded ? null : s.id); 
                                    }
                                  }}
                                  style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', cursor: 'pointer', backgroundColor: isSeriesExpanded ? '#fff' : 'transparent' }}
                                >
                                  <div style={{ backgroundColor: 'white', border: '1px solid #E0E0E0', color: 'var(--primary-red)', width: '45px', height: '45px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '1rem', flexShrink: 0 }}>
                                    {section.id === '3m' ? '3M' : 'BS'}
                                  </div>
                                  <div style={{ flex: 1 }}>
                                    <h4 style={{ color: 'var(--primary-blue)', fontSize: '1.05rem', marginBottom: '0.2rem', fontWeight: 'bold' }}>{s.title}</h4>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.4', margin: 0 }}>{s.desc}</p>
                                  </div>
                                  <div style={{ transform: (seriesModels.length > 0 && isSeriesExpanded) ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}>
                                    <ChevronRight size={20} color="#ccc" />
                                  </div>
                                </div>
                                
                                {/* Expanded Models List */}
                                {seriesModels.length > 0 && (
                                <div className={`accordion-content ${isSeriesExpanded ? 'expanded' : ''}`}>
                                  <div className="accordion-inner">
                                    <div style={{ padding: '1rem', backgroundColor: 'white', borderTop: isSeriesExpanded ? '1px solid rgba(0,0,0,0.05)' : 'none' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                          {seriesModels.map(m => (
                                            <div key={m.id} style={{ padding: '0.8rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '8px', border: '1px solid #eee', backgroundColor: '#fafafa' }}>
                                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary-red)' }}></div>
                                                <span style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '1rem' }}>{m.name}</span>
                                              </div>
                                            </div>
                                          ))}
                                          <div 
                                            onClick={(e) => { e.stopPropagation(); setSelectedSeries(s); }}
                                            style={{ marginTop: '0.5rem', padding: '0.8rem', textAlign: 'center', color: 'white', backgroundColor: 'var(--primary-blue)', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                                          >
                                            ดูรายละเอียดสเปคทั้งหมด
                                          </div>
                                        </div>
                                    </div>
                                  </div>
                                </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div style={{ padding: '1.5rem 0', color: 'var(--text-muted)', fontSize: '1.1rem', textAlign: 'center' }}>ไม่มีข้อมูลรุ่นฟิล์มในกลุ่มนี้</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
          ))}
        </div>
        )}
      </div>
      </div>
      </div>
      </div>
    </div>
  );

  const renderWorks = () => {
    const filteredSeries = series.filter(s => {
      const matchesGroup = activeGroupId === 'all' || s.groupId === activeGroupId;
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = searchQuery === '' || 
        s.title.toLowerCase().includes(searchLower) || 
        s.desc.toLowerCase().includes(searchLower) ||
        models.some(m => m.seriesId === s.id && m.name.toLowerCase().includes(searchLower));
      return matchesGroup && matchesSearch;
    });
    return (
      <div className="mobile-view" style={{ backgroundColor: '#fafafa', minHeight: '100vh', paddingBottom: '80px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '1.5rem 1.5rem 1rem', backgroundColor: '#fff', position: 'sticky', top: 0, zIndex: 10 }}>
          <ArrowLeft size={28} color="#1a2b4c" onClick={() => setCurrentTab('home')} style={{ cursor: 'pointer' }} strokeWidth={2.5} />
          <h2 style={{ flex: 1, textAlign: 'center', fontSize: '1.25rem', fontWeight: 'bold', color: '#1a2b4c', margin: 0, marginRight: '28px' }}>รุ่นฟิล์ม 3M</h2>
        </div>

        {/* Search Bar */}
        <div style={{ padding: '0 1.5rem 1rem', backgroundColor: '#fff' }}>
          <div style={{ position: 'relative' }}>
            <Search size={20} color="#999" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="ค้นหารุ่นฟิล์ม..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 44px', borderRadius: '12px', border: '1px solid #e0e0e0', fontSize: '0.95rem', outline: 'none', backgroundColor: '#f9f9f9', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Filters */}
        <div style={{ padding: '0.5rem 1.5rem 1rem', display: 'flex', gap: '0.8rem', overflowX: 'auto', WebkitOverflowScrolling: 'touch', backgroundColor: '#fff' }} className="hide-scrollbar">
          {[{ id: 'all', title: 'ทั้งหมด' }, ...groups].map(group => (
            <div 
              key={group.id}
              onClick={() => setActiveGroupId(group.id)}
              style={{ 
                padding: '0.65rem 1.2rem', 
                borderRadius: '20px', 
                whiteSpace: 'nowrap',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: activeGroupId === group.id ? 'var(--primary-red)' : '#f0f0f0',
                color: activeGroupId === group.id ? '#fff' : '#666',
              }}
            >
              {group.title.replace('ฟิล์ม', '').replace(' 3M', '')}
            </div>
          ))}
        </div>

        <div className="works-list" style={{ padding: '1rem' }}>
          {filteredSeries.map(s => {
            const seriesModels = models.filter(m => m.seriesId === s.id);
            return (
              <div 
                key={s.id} 
                onClick={() => setSelectedSeries(s)} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '0.8rem 1rem', 
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  border: '1px solid #f0f0f0',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
                  marginBottom: '0.6rem',
                  cursor: 'pointer'
                }}
              >
                <div style={{ width: '45px', height: '45px', backgroundColor: 'white', border: '1px solid #E0E0E0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-red)', fontWeight: 'bold', fontSize: '0.9rem', marginRight: '1rem', flexShrink: 0 }}>
                  3M
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ color: 'var(--primary-blue)', fontSize: '1.05rem', fontWeight: 'bold', marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '0.5rem', lineHeight: '1.4' }}>{s.desc}</p>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {seriesModels.map(m => (
                      <span key={m.id} style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', backgroundColor: 'var(--bg-light)', borderRadius: '4px', color: 'var(--text-muted)' }}>{m.name}</span>
                    ))}
                  </div>
                </div>
                <ChevronRight size={18} color="#ccc" style={{ marginLeft: '0.5rem' }} />
              </div>
            )
          })}
        </div>
      </div>
    );
  };

  const renderDetail = () => {
    if (!selectedSeries) return null;
    const seriesModels = models.filter(m => m.seriesId === selectedSeries.id);
    const seriesSamples = portfolio.filter(p => p.seriesId === selectedSeries.id && p.type === 'sample');
    const seriesPortfolio = portfolio.filter(p => p.seriesId === selectedSeries.id && p.type !== 'sample');
    const showFilmSampleHeading = ['g1', 'g2'].includes(selectedSeries.groupId);

    const handleShare = async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: selectedSeries.title,
            text: `ดูข้อมูล 3M รุ่น ${selectedSeries.title}\n${selectedSeries.desc}`,
            url: `${window.location.origin}/?series=${selectedSeries.id}`,
          });
        } catch (err) {
          console.error('Error sharing:', err);
        }
      } else {
        alert('เบราว์เซอร์ของคุณไม่รองรับการแชร์โดยตรง กรุณาคัดลอกลิงก์หน้าเว็บเพื่อแชร์ครับ');
      }
    };

    return (
      <div className="mobile-view bg-white detail-view">
        <div className="nav-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem' }}>
          <button className="back-button" onClick={() => setSelectedSeries(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <ArrowLeft size={24} />
          </button>
          <div style={{ width: 24 }}></div>
        </div>

        <div className="detail-content" style={{ padding: '0 1.5rem', paddingBottom: '2rem' }}>
          <h1 className="detail-title" style={{ color: 'var(--primary-blue)', fontSize: '1.8rem', fontWeight: '900' }}>{selectedSeries.title}</h1>
          {selectedSeries.longDesc && selectedSeries.longDesc !== '<p><br></p>' ? (
            <div className="detail-desc rich-text-content" dangerouslySetInnerHTML={{ __html: selectedSeries.longDesc }} style={{ marginTop: '0.5rem', marginBottom: '1.5rem', padding: 0 }} />
          ) : (
            <p className="detail-desc" style={{ marginTop: '0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: '1.5' }}>{selectedSeries.desc}</p>
          )}
          
          <div className="action-buttons mb-6">
             <button className="btn-share" onClick={handleShare} style={{ borderColor: 'var(--primary-blue)', color: 'var(--primary-blue)' }}><Share2 size={20} /> แชร์ข้อมูล</button>
             {selectedSeries.referenceFile && (
               <a href="#" onClick={(e) => handleForceDownload(e, selectedSeries.referenceFile, 'reference-document')} className="btn-download" style={{ textDecoration: 'none', textAlign: 'center', backgroundColor: 'var(--primary-red)' }}>ดาวน์โหลดเอกสารอ้างอิง</a>
             )}
          </div>
          
          {seriesSamples.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {seriesSamples.map((sample) => (
                  <div key={sample.id}>
                    {showFilmSampleHeading && (
                      <SectionHeader
                        icon={Image}
                        title="ตัวอย่างสีและความเข้มฟิล์ม"
                        subtitle={
                          <>
                            {sample.title}
                            {sample.modelId && (
                              <span style={{ color: 'var(--primary-red)', fontWeight: 'bold', marginLeft: '0.5rem' }}>
                                <span style={{ color: '#ccc', marginRight: '0.5rem', fontWeight: 'normal' }}>|</span>
                                {models.find(m => m.id === sample.modelId)?.name}
                              </span>
                            )}
                          </>
                        }
                      />
                    )}
                    {sample.image1 && (
                      <div style={{ marginBottom: '1.5rem' }}>
                        {sample.label1 !== '' && <p style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-dark)' }}>{sample.label1 || 'ภาพจำลองความเข้ม มองจากภายนอกอาคาร'}</p>}
                        <img 
                          src={getFullUrl(sample.image1)} 
                          alt="มองจากภายนอกอาคาร" 
                          onClick={() => setExpandedImage(getFullUrl(sample.image1))} 
                          style={{ width: '100%', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} 
                        />
                      </div>
                    )}
                    {sample.image2 && (
                      <div>
                        {sample.label2 !== '' && <p style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-dark)' }}>{sample.label2 || 'ภาพจำลองความเข้ม มองจากภายในอาคาร'}</p>}
                        <img 
                          src={getFullUrl(sample.image2)} 
                          alt="มองจากภายในอาคาร" 
                          onClick={() => setExpandedImage(getFullUrl(sample.image2))} 
                          style={{ width: '100%', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} 
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {seriesModels.length > 0 && (() => {
            const isFilmSeries = ['g1', 'g2'].includes(selectedSeries.groupId);
            const showFilmPropertyExplanation = ['g1', 'g2'].includes(selectedSeries.groupId);
            const hasSHGC = seriesModels.some(m => m.shgc && String(m.shgc).trim() !== '-');
            const hasVLT = seriesModels.some(m => m.vlt && String(m.vlt).trim() !== '-');
            const hasVLR = seriesModels.some(m => (m.vlr && String(m.vlr).trim() !== '-') || (m.reflectance && String(m.reflectance).trim() !== '-'));
            const hasUV = seriesModels.some(m => m.uv && String(m.uv).trim() !== '-');
            const hasIR = seriesModels.some(m => m.ir && String(m.ir).trim() !== '-');
            const hasTSER = seriesModels.some(m => m.tser && String(m.tser).trim() !== '-');
            const hasThickness = seriesModels.some(m => m.thickness && String(m.thickness).trim() !== '-');
            const hasPhysicalProps = seriesModels.some(m => m.tensileStrength || m.breakStrength || m.tearResistance || m.elongation || m.peelStrength || m.abrasion);
            const hasConstruction = seriesModels.some(m => m.construction && String(m.construction).trim() !== '-');
            const hasTearResistance = seriesModels.some(m => m.tearResistance && String(m.tearResistance).trim() !== '-');
            const hasTensileStrength = seriesModels.some(m => m.tensileStrength && String(m.tensileStrength).trim() !== '-');
            const hasBreakStrength = seriesModels.some(m => m.breakStrength && String(m.breakStrength).trim() !== '-');
            const hasElongation = seriesModels.some(m => m.elongation && String(m.elongation).trim() !== '-');
            const hasPeelStrength = seriesModels.some(m => m.peelStrength && String(m.peelStrength).trim() !== '-');
            const hasAbrasion = seriesModels.some(m => m.abrasion && String(m.abrasion).trim() !== '-');
            
            return (
              <div style={{ margin: '1rem -1.5rem 2rem -1.5rem', padding: '0 1.5rem' }}>
                {isFilmSeries && (
                  <SectionHeader 
                    icon={Layers} 
                    title="สเปคฟิล์ม" 
                  />
                )}
                <div style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
                  <table className="specs-table-real" style={{ width: '100%', minWidth: '500px', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--primary-blue)', color: 'white' }}>
                                                {selectedSeries.groupId === 'g1' && <th style={{ padding: '0.75rem', borderRadius: '8px 0 0 0', width: '50px' }}>เปรียบเทียบ</th>}
                        <th style={{ padding: '0.75rem', borderRadius: selectedSeries.groupId === 'g1' ? '0' : '8px 0 0 0' }}>ชื่อรุ่น</th>
                        {hasSHGC && <th style={{ padding: '0.75rem' }}>{selectedSeries.headers?.shgc || 'SHGC'}</th>}
                        {hasVLT && <th style={{ padding: '0.75rem' }}>{selectedSeries.headers?.vlt || 'VLT'}</th>}
                        {hasVLR && <th style={{ padding: '0.75rem' }}>{selectedSeries.headers?.vlr || 'VLR'}</th>}
                        {hasUV && <th style={{ padding: '0.75rem' }}>{selectedSeries.headers?.uv || 'UV'}</th>}
                        {hasIR && <th style={{ padding: '0.75rem' }}>{selectedSeries.headers?.ir || 'IR'}</th>}
                        {hasTSER && <th style={{ padding: '0.75rem' }}>{selectedSeries.headers?.tser || 'TSER'}</th>}
                        {hasThickness && <th style={{ padding: '0.75rem', borderRadius: '0 8px 0 0' }}>{selectedSeries.headers?.thickness || 'หนา'}</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {seriesModels.map((m, idx) => (
                        <tr key={m.id} style={{ backgroundColor: idx % 2 === 0 ? 'var(--bg-light)' : 'white', borderBottom: '1px solid var(--border-color)' }}>
                          {selectedSeries.groupId === 'g1' && <td style={{ padding: '0.75rem' }}>
                            <input 
                              type="checkbox" 
                              checked={compareList.some(c => c.id === m.id)}
                              onChange={() => handleToggleCompare(m)}
                              style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                            />
                          </td>}
                          <td style={{ padding: '0.75rem', fontWeight: '600' }}>{m.name}</td>
                          {hasSHGC && <td style={{ padding: '0.75rem' }}>{m.shgc && String(m.shgc).trim() !== '-' ? m.shgc : '-'}</td>}
                          {hasVLT && <td style={{ padding: '0.75rem' }}>{m.vlt && String(m.vlt).trim() !== '-' ? m.vlt : '-'}</td>}
                          {hasVLR && <td style={{ padding: '0.75rem' }}>{(m.vlr && String(m.vlr).trim() !== '-') ? m.vlr : (m.reflectance && String(m.reflectance).trim() !== '-') ? m.reflectance : '-'}</td>}
                          {hasUV && <td style={{ padding: '0.75rem' }}>{m.uv && String(m.uv).trim() !== '-' ? m.uv : '-'}</td>}
                          {hasIR && <td style={{ padding: '0.75rem' }}>{m.ir && String(m.ir).trim() !== '-' ? m.ir : '-'}</td>}
                          {hasTSER && <td style={{ padding: '0.75rem' }}>{m.tser && String(m.tser).trim() !== '-' ? m.tser : '-'}</td>}
                          {hasThickness && <td style={{ padding: '0.75rem' }}>{m.thickness && String(m.thickness).trim() !== '-' ? m.thickness : '-'}</td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {hasPhysicalProps && (
                  <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                    <h4 style={{ color: 'var(--primary-blue)', borderBottom: '2px solid var(--primary-red)', display: 'inline-block', paddingBottom: '4px', marginBottom: '1rem' }}>คุณสมบัติพื้นฐาน (Physical Properties)</h4>
                    <div style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
                      <table className="specs-table-real" style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.85rem' }}>
                        <thead>
                          <tr style={{ backgroundColor: 'var(--primary-blue)', color: 'white' }}>
                            <th style={{ padding: '0.75rem', borderRadius: '8px 0 0 0' }}>รุ่น</th>
                            {hasConstruction && <th style={{ padding: '0.75rem' }}>Construction</th>}
                            {hasTearResistance && <th style={{ padding: '0.75rem' }}>Tear Resistance</th>}
                            {hasTensileStrength && <th style={{ padding: '0.75rem' }}>Tensile Strength</th>}
                            {hasBreakStrength && <th style={{ padding: '0.75rem' }}>Break Strength</th>}
                            {hasElongation && <th style={{ padding: '0.75rem' }}>Elongation at Break</th>}
                            {hasPeelStrength && <th style={{ padding: '0.75rem' }}>Peel Strength</th>}
                            {hasAbrasion && <th style={{ padding: '0.75rem', borderRadius: '0 8px 0 0' }}>Abrasion Resistance</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {seriesModels.map((m, idx) => (
                            <tr key={m.id + '-phys'} style={{ backgroundColor: idx % 2 === 0 ? 'var(--bg-light)' : 'white', borderBottom: '1px solid var(--border-color)' }}>
                              <td style={{ padding: '0.75rem', fontWeight: '600' }}>{m.name}</td>
                              {hasConstruction && <td style={{ padding: '0.75rem' }}>{m.construction && String(m.construction).trim() !== '-' ? m.construction : '-'}</td>}
                              {hasTearResistance && <td style={{ padding: '0.75rem' }}>{m.tearResistance && String(m.tearResistance).trim() !== '-' ? m.tearResistance : '-'}</td>}
                              {hasTensileStrength && <td style={{ padding: '0.75rem' }}>{m.tensileStrength && String(m.tensileStrength).trim() !== '-' ? m.tensileStrength : '-'}</td>}
                              {hasBreakStrength && <td style={{ padding: '0.75rem' }}>{m.breakStrength && String(m.breakStrength).trim() !== '-' ? m.breakStrength : '-'}</td>}
                              {hasElongation && <td style={{ padding: '0.75rem' }}>{m.elongation && String(m.elongation).trim() !== '-' ? m.elongation : '-'}</td>}
                              {hasPeelStrength && <td style={{ padding: '0.75rem' }}>{m.peelStrength && String(m.peelStrength).trim() !== '-' ? m.peelStrength : '-'}</td>}
                              {hasAbrasion && <td style={{ padding: '0.75rem' }}>{m.abrasion && String(m.abrasion).trim() !== '-' ? m.abrasion : '-'}</td>}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                {showFilmPropertyExplanation && (hasSHGC || hasVLT || hasVLR || hasUV || hasIR || hasTSER || hasThickness) && (
                  <div style={{ marginTop: '1rem', padding: '1.2rem', backgroundColor: '#f5f7fa', borderRadius: '12px', fontSize: '0.85rem', color: '#555', border: '1px solid #eaeaea' }}>
                    <h4 style={{ margin: '0 0 0.8rem 0', color: 'var(--primary-blue)', fontSize: '0.95rem' }}>คำอธิบายค่าคุณสมบัติฟิล์ม</h4>
                    <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {hasSHGC && <li><strong>SHGC (ค่าสัมประสิทธิ์การส่งผ่านความร้อน):</strong> ยิ่งต่ำ ยิ่งกันความร้อนได้ดี</li>}
                      {hasVLT && <li><strong>VLT (% แสงส่องผ่าน):</strong> ยิ่งสูง ฟิล์มยิ่งสว่าง มองเห็นได้ชัดเจน</li>}
                      {hasVLR && <li><strong>VLR (% แสงสะท้อน):</strong> ยิ่งสูง กระจกยิ่งสะท้อนแสงมาก</li>}
                      {hasUV && <li><strong>UV (ป้องกันรังสีอัลตราไวโอเลต):</strong> ยิ่งสูง ยิ่งป้องกันรังสียูวี ปกป้องผิวและเฟอร์นิเจอร์</li>}
                      {hasIR && <li><strong>IR (ป้องกันรังสีอินฟราเรด):</strong> ยิ่งสูง ยิ่งกันรังสีความร้อนอินฟราเรดได้ดี</li>}
                      {hasTSER && <li><strong>TSER (ลดพลังงานความร้อนรวม):</strong> ยิ่งสูง ยิ่งกันความร้อนรวมจากแสงอาทิตย์ได้ดี</li>}
                      {hasThickness && <li><strong>ความหนา:</strong> หน่วยเป็น Mil (1 Mil = 0.0254 มม.)</li>}
                    </ul>
                  </div>
                )}
              </div>
            );
          })()}
          {/* Related Downloads */}
          {(() => {
            const seriesBaseName = selectedSeries.title.replace(/\s*\(.*?\)\s*/g, '').trim().toLowerCase();
            const relatedDownloads = downloadsList.filter(d => 
              (d.seriesId && d.seriesId === selectedSeries.id) || 
              (!d.seriesId && d.title.toLowerCase().includes(seriesBaseName))
            );
            if (relatedDownloads.length === 0) return null;
            return (
              <div style={{ marginBottom: '2rem' }}>
                <SectionHeader 
                  icon={Download} 
                  title="ไฟล์ที่เกี่ยวข้อง" 
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                  {relatedDownloads.map(item => (
                    <a 
                      key={item.id}
                      href="#" 
                      onClick={(e) => handleForceDownload(e, getFullUrl(item.file), item.title || item.ext)}
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', 
                        backgroundColor: '#f8f9fa', borderRadius: '12px', textDecoration: 'none', 
                        border: '1px solid #eee', color: 'var(--text-dark)'
                      }}
                    >
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--primary-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                        {(() => {
                          const ext = (item.file || '').split('.').pop().toLowerCase();
                          if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return <Image size={20} />;
                          if (['pdf'].includes(ext)) return <FileText size={20} />;
                          return <Download size={20} />;
                        })()}
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: '600', fontSize: '0.95rem', lineHeight: '1.4', whiteSpace: 'pre-line' }}>{item.title}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                          <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--primary-blue)', backgroundColor: 'rgba(0, 45, 114, 0.05)' }}>
                            {item.category === 'catalog' ? 'แคตตาล็อก' : item.category === 'spec' ? 'สเปคชีท' : item.category === 'manual' ? 'คู่มือ' : 'เอกสาร'}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.info}</span>
                        </div>
                      </div>
                      <ChevronRight size={18} color="var(--primary-blue)" />
                    </a>
                  ))}
                </div>
              </div>
            );
          })()}

          {seriesPortfolio.length > 0 && (
            <>
              <SectionHeader 
                icon={Briefcase} 
                title="ผลงานติดตั้ง" 
                subtitle={`ภาพตัวอย่างผลงานการติดตั้งฟิล์มรุ่น ${selectedSeries.title}`} 
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {seriesPortfolio.map((work) => (
                  <div key={work.id}>
                    <h4 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
                      {work.modelId && (
                        <span style={{ color: 'var(--primary-red)', fontWeight: 'bold' }}>
                          {models.find(m => m.id === work.modelId)?.name}
                          <span style={{ color: '#ccc', marginLeft: '0.5rem', marginRight: '0.5rem', fontWeight: 'normal' }}>|</span>
                        </span>
                      )}
                      {work.title}
                    </h4>
                    <BeforeAfterSlider 
                      beforeImage={getFullUrl(work.beforeImage)} 
                      afterImage={getFullUrl(work.afterImage)} 
                      beforeLabel={work.beforeLabel}
                      afterLabel={work.afterLabel}
                    />
                    {(work.image1 || work.image2 || work.image3 || work.image4) && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginTop: '1rem' }}>
                        {work.image1 && <img src={getFullUrl(work.image1)} alt="img1" onClick={() => setExpandedImage(getFullUrl(work.image1))} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer' }} />}
                        {work.image2 && <img src={getFullUrl(work.image2)} alt="img2" onClick={() => setExpandedImage(getFullUrl(work.image2))} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer' }} />}
                        {work.image3 && <img src={getFullUrl(work.image3)} alt="img3" onClick={() => setExpandedImage(getFullUrl(work.image3))} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer' }} />}
                        {work.image4 && <img src={getFullUrl(work.image4)} alt="img4" onClick={() => setExpandedImage(getFullUrl(work.image4))} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer' }} />}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

        </div>
      </div>
    );
  };
  if (showWelcome) {
    return (
      <div className="welcome-screen" style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        backgroundColor: '#f8f9fc', zIndex: 9999, overflowX: 'hidden', overflowY: 'auto',
        display: 'flex', flexDirection: 'column'
      }}>
        {/* Hidden admin button */}
        <div 
          onClick={(e) => { e.stopPropagation(); navigate('/admin'); }}
          style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', zIndex: 100, cursor: 'pointer' }}
        />

        {/* Top Section with Building Image */}
        <div style={{ position: 'relative', width: '100%', height: '40vh', minHeight: '320px', backgroundColor: '#eef2f6' }}>
          <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', zIndex: 10 }}>
            <img src="/logo-app.png" alt="GOODFILM" style={{ height: '48px' }} />
          </div>
          <img 
            src="/welcome.png" 
            alt="Building" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
          {/* Curve overlay at the bottom of the building image */}
          <div style={{ position: 'absolute', bottom: '-1px', left: 0, width: '100%', overflow: 'hidden', lineHeight: 0 }}>
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '50px' }}>
              <path d="M0,40 Q600,120 1200,0 L1200,120 L0,120 Z" fill="#f8f9fc"></path>
              <path d="M0,40 Q600,120 1200,0" fill="none" stroke="var(--primary-blue)" strokeWidth="6"></path>
              <path d="M0,40 Q600,120 1200,0" fill="none" stroke="var(--primary-red)" strokeWidth="3" transform="translate(0, -6)"></path>
            </svg>
          </div>
        </div>

        {/* Content Section */}
        <div style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
          <h1 style={{ color: 'var(--primary-blue)', fontSize: '1.6rem', fontWeight: 'bold', marginBottom: '0.4rem', textAlign: 'center' }}>
            ยินดีต้อนรับสู่ GOODFILM
          </h1>
          <p style={{ color: '#444', fontSize: '1rem', marginBottom: '1.5rem', fontWeight: '500', textAlign: 'center' }}>
            E-Catalog ออนไลน์ และผลงานติดตั้งฟิล์มกรองแสงอาคาร
          </p>
          <p style={{ color: '#777', fontSize: '0.85rem', marginBottom: '2.5rem', lineHeight: '1.5', maxWidth: '320px', textAlign: 'center' }}>
            รวมข้อมูลสินค้า 3M ดูตัวอย่างผลงานจริง เปรียบเทียบสเปค และดาวน์โหลดเอกสารได้ในแอปเดียว
          </p>

          <button 
            onClick={() => { setShowWelcome(false); setCurrentTab('home'); }}
            style={{ 
              width: '100%', maxWidth: '340px', padding: '1.1rem', backgroundColor: 'var(--primary-blue)', color: 'white', 
              border: 'none', borderRadius: '14px', fontSize: '1.1rem', fontWeight: 'bold', 
              display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative',
              marginBottom: '1rem', boxShadow: '0 6px 15px rgba(0, 51, 160, 0.25)', cursor: 'pointer'
            }}
          >
            <span>เริ่มใช้งาน</span> 
            <ChevronRight size={22} style={{ position: 'absolute', right: '1rem' }} />
          </button>
          
          <button 
            onClick={() => { setShowWelcome(false); setCurrentTab('works'); }}
            style={{ 
              width: '100%', maxWidth: '340px', padding: '1.1rem', backgroundColor: 'transparent', color: 'var(--primary-blue)', 
              border: '2px solid var(--primary-blue)', borderRadius: '14px', fontSize: '1.1rem', fontWeight: 'bold', 
              display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', position: 'relative',
              marginBottom: '2.5rem', cursor: 'pointer'
            }}
          >
            <Building2 size={22} /> <span>ดูผลงานตัวอย่าง</span> 
            <ChevronRight size={22} style={{ position: 'absolute', right: '1rem' }} />
          </button>

          {/* 4 Icons Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '340px', marginBottom: '3rem' }}>
            <div onClick={() => { setShowWelcome(false); setCurrentTab('home'); }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', width: '22%', cursor: 'pointer' }}>
              <div style={{ width: '56px', height: '56px', backgroundColor: 'white', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.05), inset 0 0 0 1px rgba(0,0,0,0.02)', color: 'var(--primary-blue)' }}>
                <BookOpen size={28} strokeWidth={1.25} />
              </div>
              <span style={{ fontSize: '0.65rem', color: '#555', fontWeight: '600', whiteSpace: 'nowrap' }}>E-Catalog</span>
            </div>
            
            <div onClick={() => { setShowWelcome(false); setCurrentTab('works'); setActiveGroupId('all'); }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', width: '22%', cursor: 'pointer' }}>
              <div style={{ width: '56px', height: '56px', backgroundColor: 'white', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.05), inset 0 0 0 1px rgba(0,0,0,0.02)', color: 'var(--primary-blue)' }}>
                <Building2 size={28} strokeWidth={1.25} />
              </div>
              <span style={{ fontSize: '0.65rem', color: '#555', fontWeight: '600', whiteSpace: 'nowrap' }}>ผลงานจริง</span>
            </div>

            <div onClick={() => { setShowWelcome(false); setShowCompareModal(true); }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', width: '22%', cursor: 'pointer' }}>
              <div style={{ width: '56px', height: '56px', backgroundColor: 'white', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.05), inset 0 0 0 1px rgba(0,0,0,0.02)', color: 'var(--primary-blue)' }}>
                <GitCompare size={28} strokeWidth={1.25} />
              </div>
              <span style={{ fontSize: '0.65rem', color: '#555', fontWeight: '600', whiteSpace: 'nowrap' }}>เทียบสเปค</span>
            </div>

            <div onClick={() => { setShowWelcome(false); setCurrentTab('download'); }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', width: '22%', cursor: 'pointer' }}>
              <div style={{ width: '56px', height: '56px', backgroundColor: 'white', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.05), inset 0 0 0 1px rgba(0,0,0,0.02)', color: 'var(--primary-blue)' }}>
                <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <FileText size={28} strokeWidth={1.25} />
                  <Download size={14} strokeWidth={2.5} color="var(--primary-red)" style={{ position: 'absolute', bottom: -2, right: -4, backgroundColor: 'white', borderRadius: '50%', padding: '1px' }} />
                </div>
              </div>
              <span style={{ fontSize: '0.65rem', color: '#555', fontWeight: '600', whiteSpace: 'nowrap', position: 'relative', left: '-2px' }}>ดาวน์โหลดเอกสาร</span>
            </div>
          </div>

          {/* Footer text */}
          <div style={{ fontSize: '0.85rem', color: '#555', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: 'auto', paddingBottom: '1rem' }}>
            <span>ใช้งานง่าย</span>
            <span style={{ color: 'var(--primary-blue)' }}>•</span>
            <span>สวยงาม</span>
            <span style={{ color: 'var(--primary-red)' }}>•</span>
            <span>ครบจบในแอปเดียว</span>
          </div>
        </div>
      </div>
    );
  }

  const renderDownload = () => {
    return (
      <div className="mobile-view" style={{ backgroundColor: '#fafafa', minHeight: '100vh', paddingBottom: '80px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '1.5rem 1.5rem 1rem', backgroundColor: '#fff', position: 'sticky', top: 0, zIndex: 10 }}>
          <ArrowLeft size={28} color="#1a2b4c" onClick={() => setCurrentTab('home')} style={{ cursor: 'pointer' }} strokeWidth={2.5} />
          <h2 style={{ flex: 1, textAlign: 'center', fontSize: '1.25rem', fontWeight: 'bold', color: '#1a2b4c', margin: 0, marginRight: '28px' }}>เอกสารดาวน์โหลด</h2>
        </div>

        {/* Search Bar */}
        <div style={{ padding: '0 1.5rem 1rem', backgroundColor: '#fff' }}>
          <div style={{ position: 'relative' }}>
            <Search size={20} color="#999" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อเอกสาร หรือ ไฟล์..." 
              value={downloadSearchQuery}
              onChange={(e) => setDownloadSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 44px', borderRadius: '12px', border: '1px solid #e0e0e0', fontSize: '0.95rem', outline: 'none', backgroundColor: '#f9f9f9', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Filters */}
        <div style={{ padding: '0.5rem 1.5rem 1rem', display: 'flex', gap: '0.8rem', overflowX: 'auto', WebkitOverflowScrolling: 'touch', backgroundColor: '#fff' }} className="hide-scrollbar">
          {[{ id: 'all', label: 'ทั้งหมด' }, { id: 'catalog', label: 'แคตตาล็อก' }, { id: 'spec', label: 'Data Sheet' }, { id: 'test_report', label: 'Test Report' }, { id: 'other', label: 'อื่นๆ' }].map(f => (
            <div 
              key={f.id}
              onClick={() => setDownloadFilter(f.id)}
              style={{ 
                padding: '0.65rem 1.2rem', 
                borderRadius: '12px', 
                fontSize: '0.95rem', 
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                backgroundColor: downloadFilter === f.id ? 'var(--primary-red)' : '#f2f4f7',
                color: downloadFilter === f.id ? 'white' : '#666',
                transition: 'all 0.2s ease'
              }}
            >
              {f.label}
            </div>
          ))}
        </div>

        {/* List */}
        <div style={{ padding: '1rem 1.5rem' }}>
          {downloadsList.filter(d => 
            (downloadFilter === 'all' || d.category === downloadFilter) &&
            (!downloadSearchQuery || d.title.toLowerCase().includes(downloadSearchQuery.toLowerCase()) || (d.file && d.file.toLowerCase().includes(downloadSearchQuery.toLowerCase())))
          ).map(doc => (
            <div key={doc.id} style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', padding: '0.8rem 1rem', borderRadius: '12px', marginBottom: '0.6rem', border: '1px solid #f0f0f0', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', gap: '1.2rem' }}>
              {/* Document Icon */}
              <div style={{ position: 'relative', width: '54px', height: '64px', border: '1.5px solid rgba(211,47,47,0.4)', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, backgroundColor: 'white' }}>
                <div style={{ backgroundColor: 'var(--primary-red)', borderRadius: '6px', width: '32px', height: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '2px', marginTop: '2px' }}>
                  <FileText size={14} color="white" />
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--primary-red)', fontWeight: '900', letterSpacing: '0.5px' }}>{doc.ext}</div>
              </div>
              
              {/* Info */}
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#1a2b4c', marginBottom: '0.4rem', lineHeight: '1.5', whiteSpace: 'pre-line' }}>{doc.title}</h4>
                <p style={{ fontSize: '0.8rem', color: '#666', margin: 0, fontWeight: '600' }}>{doc.info}</p>
              </div>

              {/* Download Icon (Clickable Link) */}
              {doc.category === 'test_report' ? (
                <div onClick={() => setDownloadPasswordPrompt({ isOpen: true, doc: doc, password: '', error: '' })} style={{ width: '36px', height: '36px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#00205B', cursor: 'pointer', flexShrink: 0 }}>
                  <Download size={24} strokeWidth={2.5} />
                </div>
              ) : (
                <a href="#" onClick={(e) => handleForceDownload(e, getFullUrl(doc.file), doc.title || doc.ext)} style={{ width: '36px', height: '36px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#00205B', cursor: 'pointer', flexShrink: 0, textDecoration: 'none' }}>
                  <Download size={24} strokeWidth={2.5} />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderContact = () => {
    const contactHtml = `
<style><!--
.gfs-contact {
  font-family: 'Sarabun', sans-serif;
  background: #ffffff;
  padding: 36px 16px;
  color: #1f2937;
  line-height: 1.75;
}

.gfs-contact * {
  box-sizing: border-box;
}

.gfs-contact-wrap {
  max-width: 100%;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
}

.gfs-contact-info,
.gfs-contact-map {
  background: #ffffff;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 16px 38px rgba(27, 67, 124, 0.12);
  border: 1px solid rgba(27, 67, 124, 0.08);
}

.gfs-contact-info {
  padding: 24px;
  position: relative;
}

.gfs-contact-info::before {
  content: "";
  position: absolute;
  inset: 0 0 auto 0;
  height: 5px;
  background: linear-gradient(90deg, #1b437c, #005eb8);
}

.gfs-contact-badge {
  display: inline-block;
  background: #eef3f8;
  color: #1b437c;
  padding: 7px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 14px;
}

.gfs-contact-title {
  margin: 0 0 8px;
  font-size: 22px;
  line-height: 1.25;
  color: #1b437c;
  font-weight: 800;
}

.gfs-contact-desc {
  margin: 0 0 20px;
  color: #4b5563;
  font-size: 14px;
}

.gfs-company {
  padding: 18px;
  background: linear-gradient(135deg, #1b437c, #005eb8);
  color: #ffffff;
  border-radius: 20px;
  margin-bottom: 16px;
}

.gfs-company strong {
  display: block;
  font-size: 16px;
  margin-bottom: 4px;
}

.gfs-company span {
  display: block;
  font-size: 13px;
  color: #eaf3fb;
}

.gfs-contact-list {
  display: grid;
  gap: 6px;
}

.gfs-contact-row {
  display: grid;
  grid-template-columns: 92px minmax(0, 1fr);
  align-items: start;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 14px;
  background: #eef3f8;
  border: 1px solid #dbe7f3;
}

.gfs-label {
  font-size: 12px;
  color: #667085;
  margin: 0;
  font-weight: 600;
  line-height: 1.45;
}

.gfs-value {
  font-size: 14px;
  color: #1f2937;
  font-weight: 600;
  line-height: 1.45;
  overflow-wrap: anywhere;
}

.gfs-value a {
  color: #005eb8;
  text-decoration: none;
}

.gfs-value a:hover {
  text-decoration: underline;
}

.gfs-contact-actions {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  margin-top: 18px;
}

.gfs-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 12px 16px;
  border-radius: 20px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 800;
  transition: 0.25s ease;
  text-align: center;
  border: 1px solid transparent;
}

.gfs-btn-main {
  background: #1b437c;
  color: #ffffff;
}

.gfs-btn-main:hover {
  background: #005eb8;
  transform: translateY(-2px);
}

.gfs-btn-line {
  background: #005eb8;
  color: #ffffff;
}

.gfs-btn-line:hover {
  background: #1b437c;
  transform: translateY(-2px);
}

.gfs-btn-outline {
  background: #ffffff;
  color: #1b437c;
  border-color: #c7d9ec;
}

.gfs-btn-outline:hover {
  background: #eef3f8;
  transform: translateY(-2px);
}

.gfs-contact-map {
  min-height: 360px;
  position: relative;
}

.gfs-contact-map iframe {
  width: 100%;
  height: 100%;
  min-height: 360px;
  border: 0;
  display: block;
}

.gfs-map-cover {
  margin: 12px;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 20px;
  padding: 14px 16px;
  box-shadow: 0 10px 24px rgba(27, 67, 124, 0.12);
  border-left: 5px solid #005eb8;
}

.gfs-map-cover strong {
  display: block;
  color: #1b437c;
  font-size: 18px;
  margin-bottom: 4px;
}

.gfs-map-cover span {
  display: block;
  color: #4b5563;
  font-size: 16px;
}

@media (min-width: 768px) {
  .gfs-contact-actions {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 920px) {
  .gfs-contact-wrap {
    grid-template-columns: 0.95fr 1.05fr;
    align-items: stretch;
  }

  .gfs-contact-map,
  .gfs-contact-map iframe {
    min-height: 520px;
  }

  .gfs-map-cover {
    position: absolute;
    left: 16px;
    right: 16px;
    bottom: 16px;
    margin: 0;
    backdrop-filter: blur(10px);
  }
}

@media (max-width: 560px) {
  .gfs-contact {
    padding: 28px 12px;
  }

  .gfs-contact-info {
    padding: 20px;
  }

  .gfs-contact-title {
    font-size: 32px;
  }
}
--></style>
<section class="gfs-contact">
<div class="gfs-contact-wrap">
<div class="gfs-contact-info">
<div class="gfs-contact-badge">CONTACT GOODFILM</div>
<h1 class="gfs-contact-title">ติดต่อเรา</h1>
<p class="gfs-contact-desc">ปรึกษาฟิล์มกรองแสงอาคาร ฟิล์มนิรภัย และฟิล์มตกแต่งกระจก 3M พร้อมทีมงานมืออาชีพ</p>
<div class="gfs-company"><strong>บริษัท กู๊ดฟิล์ม จำกัด</strong>สำนักงานใหญ่ | เลขประจำตัวผู้เสียภาษี 0105554060900</div>
<div class="gfs-contact-list">
<div class="gfs-contact-row">
<div class="gfs-label">ที่อยู่</div>
<div class="gfs-value">914/10-11 ถนนลาซาล แขวงบางนา เขตบางนา กรุงเทพฯ 10260</div>
</div>
<div class="gfs-contact-row">
<div class="gfs-label">โทรศัพท์</div>
<div class="gfs-value"><a href="tel:020963424">02-096-3424</a> | <a href="tel:0970972103">097-097-2103</a></div>
</div>
<div class="gfs-contact-row">
<div class="gfs-label">อีเมล</div>
<div class="gfs-value"><a href="mailto:goodfilmshop@gmail.com">goodfilmshop@gmail.com</a></div>
</div>
<div class="gfs-contact-row">
<div class="gfs-label">LINE Official</div>
<div class="gfs-value"><a href="https://line.me/R/ti/p/@goodfilm" target="_blank" rel="noopener">@goodfilm</a></div>
</div>
<div class="gfs-contact-row">
<div class="gfs-label">เวลาทำการ</div>
<div class="gfs-value">จันทร์ - เสาร์ เวลา 08.00 - 17.00 น.</div>
</div>
</div>
<div class="gfs-contact-actions">
<a class="gfs-btn gfs-btn-main" href="tel:020963424">
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
  โทรหาเรา
</a> 
<a class="gfs-btn gfs-btn-line" href="https://line.me/R/ti/p/@goodfilm" target="_blank" rel="noopener">
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
  แอด LINE
</a> 
<a class="gfs-btn gfs-btn-outline" href="https://www.goodfilmshop.com/" target="_blank" rel="noopener">
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
  เว็บไซต์
</a> 
<a class="gfs-btn gfs-btn-outline" href="https://maps.app.goo.gl/S1HWg2rUgHvW3yw89" target="_blank" rel="noopener">
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
  เปิดแผนที่
</a>
</div>
</div>
<div class="gfs-contact-map"><iframe src="https://www.google.com/maps?q=GOODFILM%20CO.%2C%20LTD.%20914%2F10-11%20Lasalle%20Road%20Bangna%20Bangkok%2010260&amp;output=embed" width="300" height="150" allowfullscreen="allowfullscreen">
      </iframe>
<div class="gfs-map-cover"><strong>GOODFILM สำนักงานใหญ่</strong>ถนนลาซาล บางนา กรุงเทพฯ ติดต่อปรึกษางานฟิล์มอาคารและงานโครงการได้โดยตรง</div>
</div>
</div>
</section>
    `;
    
    return <div dangerouslySetInnerHTML={{ __html: contactHtml }} style={{ paddingBottom: '2rem' }} />;
  };

  return (
    <div className="app-mobile-container">
      {/* Sidebar Drawer */}
      {isSidebarOpen && (
        <>
          <div 
            className="sidebar-overlay" 
            onClick={() => setIsSidebarOpen(false)}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 100 }}
          />
          <div 
            className="sidebar-drawer"
            style={{ 
              position: 'fixed', top: 0, left: 0, bottom: 0, width: '320px', 
              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
              backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              zIndex: 101, 
              boxShadow: '15px 0 40px rgba(0,0,0,0.1)', 
              animation: 'slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              display: 'flex', flexDirection: 'column',
              borderRight: '1px solid rgba(255,255,255,0.4)'
            }}
          >
            <div style={{ padding: '3rem 2rem 2rem 2rem', background: 'linear-gradient(135deg, var(--primary-blue) 0%, #001f5c 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
              <img src="/logo-app.png" alt="GOODFILM Logo" style={{ height: '45px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
              <p style={{ fontSize: '0.85rem', marginTop: '1rem', opacity: 0.9, letterSpacing: '0.5px' }}>3M Authorized Distributor</p>
            </div>
            <div style={{ padding: '1.5rem 1rem', flex: 1, overflowY: 'auto' }}>
              <div className="sidebar-item" onClick={() => { setIsSidebarOpen(false); setCurrentTab('home'); setSelectedSeries(null); }} style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', borderRadius: '12px', marginBottom: '0.5rem', transition: 'all 0.2s ease', backgroundColor: currentTab === 'home' ? 'var(--light-blue)' : 'transparent', color: currentTab === 'home' ? 'var(--primary-blue)' : 'var(--text-main)' }}>
                <Home size={22} color={currentTab === 'home' ? 'var(--primary-blue)' : '#666'} /> <span style={{ fontWeight: '600', fontSize: '1.05rem' }}>หน้าหลัก</span>
              </div>
              <div className="sidebar-item" onClick={() => { setIsSidebarOpen(false); setCurrentTab('works'); setSelectedSeries(null); setActiveGroupId('all'); }} style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', borderRadius: '12px', marginBottom: '0.5rem', transition: 'all 0.2s ease', backgroundColor: currentTab === 'works' ? 'var(--light-blue)' : 'transparent', color: currentTab === 'works' ? 'var(--primary-blue)' : 'var(--text-main)' }}>
                <Briefcase size={22} color={currentTab === 'works' ? 'var(--primary-blue)' : '#666'} /> <span style={{ fontWeight: '600', fontSize: '1.05rem' }}>รายการฟิล์มทั้งหมด</span>
              </div>
              <div className="sidebar-item" onClick={() => { setIsSidebarOpen(false); setCurrentTab('contact'); setSelectedSeries(null); }} style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', borderRadius: '12px', marginBottom: '0.5rem', transition: 'all 0.2s ease', backgroundColor: currentTab === 'contact' ? 'var(--light-blue)' : 'transparent', color: currentTab === 'contact' ? 'var(--primary-blue)' : 'var(--text-main)' }}>
                <Phone size={22} color={currentTab === 'contact' ? 'var(--primary-blue)' : '#666'} /> <span style={{ fontWeight: '600', fontSize: '1.05rem' }}>ติดต่อเรา</span>
              </div>
            </div>
            <div style={{ padding: '1.5rem', borderTop: '1px solid #f0f0f0', textAlign: 'center' }}>
              <p style={{ fontSize: '0.8rem', color: '#999' }}>© 2026 GOODFILM App</p>
            </div>
          </div>
        </>
      )}

      <div className="mobile-content-area" style={{ height: 'auto', overflow: 'auto', position: 'relative' }}>
        <img 
          src="/logo-app.png" 
          alt="GOODFILM" 
          style={{ 
            position: 'fixed', 
            top: '16px', 
            right: '16px', 
            height: '35px', 
            objectFit: 'contain', 
            zIndex: 90, 
            pointerEvents: 'none' 
          }} 
        />
        {selectedSeries ? renderDetail() : (currentTab === 'home' || currentTab === 'search') ? renderHome() : currentTab === 'download' ? renderDownload() : currentTab === 'contact' ? renderContact() : renderWorks()}
      </div>

      <nav className="bottom-nav">
        <div className={`nav-item ${currentTab === 'home' && !selectedSeries ? 'active' : ''}`} onClick={() => { setCurrentTab('home'); setSelectedSeries(null); }}>
          <Home size={24} />
          <span style={{ fontSize: '0.65rem', marginTop: '4px' }}>หน้าหลัก</span>
        </div>
        <div className={`nav-item ${currentTab === 'search' && !selectedSeries ? 'active' : ''}`} onClick={() => { setCurrentTab('search'); setSelectedSeries(null); setTimeout(() => { document.querySelector('.search-input')?.focus(); window.scrollTo({ top: 0, behavior: 'smooth' }); }, 100); }}>
          <Search size={24} />
          <span style={{ fontSize: '0.65rem', marginTop: '4px' }}>ค้นหา</span>
        </div>
        <div className={`nav-item ${currentTab === 'works' && !selectedSeries ? 'active' : ''}`} onClick={() => { setCurrentTab('works'); setSelectedSeries(null); }}>
          <Briefcase size={24} />
          <span style={{ fontSize: '0.65rem', marginTop: '4px' }}>รุ่นสินค้า</span>
        </div>
        <div className={`nav-item ${showCompareModal ? 'active' : ''}`} onClick={() => setShowCompareModal(true)}>
          <GitCompare size={24} />
          <span style={{ fontSize: '0.65rem', marginTop: '4px' }}>เทียบสเปค</span>
        </div>
        <div className={`nav-item ${currentTab === 'download' && !selectedSeries ? 'active' : ''}`} onClick={() => { setCurrentTab('download'); setSelectedSeries(null); }}>
          <Download size={24} />
          <span style={{ fontSize: '0.65rem', marginTop: '4px' }}>แคตตาล็อก</span>
        </div>
        <div className={`nav-item ${currentTab === 'contact' && !selectedSeries ? 'active' : ''}`} onClick={() => { setCurrentTab('contact'); setSelectedSeries(null); }}>
          <Phone size={24} />
          <span style={{ fontSize: '0.65rem', marginTop: '4px' }}>ติดต่อ</span>
        </div>
      </nav>


      {/* Fullscreen Image Lightbox */}
      {expandedImage && (
        <div 
          style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.95)', zIndex: 10000,
            display: 'flex', justifyContent: 'center', alignItems: 'center'
          }}
        >
          {/* Action Bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)', zIndex: 10001 }}>
             <div style={{ display: 'flex', gap: '0.8rem' }}>
                <button onClick={(e) => handleForceDownload(e, expandedImage, expandedImage.split('/').pop(), true)} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '0.5rem 1rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}>
                  <Download size={16} /> บันทึกรูป
                </button>
                {(isMobile && navigator.share) && (
                  <button onClick={(e) => { 
                    e.stopPropagation(); 
                    if (expandedImageFile && navigator.canShare && navigator.canShare({ files: [expandedImageFile] })) {
                      navigator.share({ files: [expandedImageFile] }).catch(console.error);
                    } else {
                      navigator.share({ title: 'GOODFILM Image', url: expandedImage }).catch(console.error);
                    }
                  }} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '0.5rem 1rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    <Share2 size={16} /> ส่งต่อ
                  </button>
                )}
             </div>
             <button onClick={() => setExpandedImage(null)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', fontSize: '1.2rem' }}>
                ✕
             </button>
          </div>

          <img 
            src={expandedImage} 
            alt="Expanded" 
            style={{
              maxWidth: '100%', maxHeight: '100%', objectFit: 'contain'
            }}
          />
        </div>
      )}

      {/* Password Prompt Modal for Downloads */}
      {downloadPasswordPrompt.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, backdropFilter: 'blur(3px)' }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '350px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#1a2b4c', textAlign: 'center' }}>ใส่รหัสผ่านเอกสาร</h3>
            <p style={{ fontSize: '0.85rem', color: '#666', textAlign: 'center', marginBottom: '1.5rem' }}>เอกสารนี้ต้องการรหัสผ่านเพื่อดาวน์โหลด</p>
            <input 
              type="password" 
              value={downloadPasswordPrompt.password} 
              onChange={(e) => setDownloadPasswordPrompt({ ...downloadPasswordPrompt, password: e.target.value, error: '' })}
              placeholder="รหัสผ่าน" 
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', marginBottom: '0.5rem', boxSizing: 'border-box' }}
            />
            {downloadPasswordPrompt.error && <p style={{ color: 'red', fontSize: '0.8rem', margin: '0 0 1rem 0', textAlign: 'center' }}>{downloadPasswordPrompt.error}</p>}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button 
                onClick={() => setDownloadPasswordPrompt({ isOpen: false, doc: null, password: '', error: '' })}
                style={{ flex: 1, padding: '0.8rem', border: 'none', borderRadius: '8px', backgroundColor: '#f0f0f0', color: '#333', fontWeight: 'bold', cursor: 'pointer' }}
              >
                ยกเลิก
              </button>
              <button 
                onClick={() => {
                  if (downloadPasswordPrompt.password === 'goodfilm') {
                    // Correct password, trigger download programmatically using the safe method
                    handleForceDownload({ preventDefault: () => {} }, getFullUrl(downloadPasswordPrompt.doc.file), downloadPasswordPrompt.doc.title || downloadPasswordPrompt.doc.ext);
                    setDownloadPasswordPrompt({ isOpen: false, doc: null, password: '', error: '' });
                  } else {
                    setDownloadPasswordPrompt({ ...downloadPasswordPrompt, error: 'รหัสผ่านไม่ถูกต้อง' });
                  }
                }}
                style={{ flex: 1, padding: '0.8rem', border: 'none', borderRadius: '8px', backgroundColor: 'var(--primary-blue)', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
              >
                ตกลง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Fullscreen Lightbox */}
      {pdfActionModal.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.95)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {/* Action Bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)', zIndex: 10001 }}>
             <div style={{ display: 'flex', gap: '0.8rem' }}>
                <button 
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = pdfActionModal.blobUrl || pdfActionModal.url;
                    link.download = pdfActionModal.filename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }} 
                  style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '0.5rem 1rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}
                >
                  <Download size={16} /> บันทึกไฟล์
                </button>
                {(isMobile && navigator.share) && (
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      // Force sharing as URL (link) for PDFs to ensure the OS share sheet 
                      // provides quick access to LINE and other messaging apps just like images.
                      if (navigator.share) {
                        navigator.share({ 
                          title: pdfActionModal.filename, 
                          url: pdfActionModal.url 
                        }).catch(console.error);
                      }
                    }} 
                    style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '0.5rem 1rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}
                  >
                    <Share2 size={16} /> ส่งต่อ
                  </button>
                )}
             </div>
             <button 
                onClick={() => { 
                  if (pdfActionModal.blobUrl) window.URL.revokeObjectURL(pdfActionModal.blobUrl);
                  setPdfActionModal({ isOpen: false, url: '', filename: '', file: null, loading: false, blobUrl: null }); 
                }} 
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}
             >✕</button>
          </div>
          
          {/* Content */}
          <div style={{ width: '100%', height: '100%', paddingTop: '70px', paddingBottom: 'env(safe-area-inset-bottom, 20px)', boxSizing: 'border-box', display: 'flex', justifyContent: 'center', alignItems: 'center', WebkitOverflowScrolling: 'touch', overflowY: 'auto' }}>
            {pdfActionModal.loading ? (
              <div style={{ color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <span>กำลังโหลดเอกสาร...</span>
              </div>
            ) : pdfActionModal.error ? (
              <div style={{ color: 'var(--primary-red)', backgroundColor: 'white', padding: '1rem 2rem', borderRadius: '8px' }}>
                {pdfActionModal.error}
              </div>
            ) : (
              <iframe 
                src={pdfActionModal.blobUrl ? `${pdfActionModal.blobUrl}#toolbar=0&view=FitH` : pdfActionModal.url} 
                style={{ width: '100%', height: '100%', minHeight: '100vh', border: 'none', backgroundColor: 'white' }}
                title={pdfActionModal.filename}
              />
            )}
          </div>
        </div>
      )}

      {/* Floating Comparison Bar */}
      {compareList.length > 0 && (
        <div style={{ position: 'fixed', bottom: '70px', left: 0, right: 0, backgroundColor: 'rgba(27, 67, 124, 0.85)', color: 'white', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 99, boxShadow: '0 -4px 20px rgba(0,0,0,0.15)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
          <div style={{ fontWeight: 'bold' }}>เปรียบเทียบ {compareList.length}/3 รุ่น</div>
          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <button onClick={() => setCompareList([])} style={{ padding: '0.5rem 1rem', border: '1px solid white', borderRadius: '8px', backgroundColor: 'transparent', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>ล้าง</button>
            <button onClick={() => setShowCompareModal(true)} style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '8px', backgroundColor: 'var(--primary-red)', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>ดูตารางเทียบ</button>
          </div>
        </div>
      )}

      {/* Comparison Modal */}
      {showCompareModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '16px', width: '95%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', position: 'relative' }}>
            <button onClick={() => setShowCompareModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', border: 'none', background: '#f0f0f0', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>✕</button>
            <h2 style={{ margin: '0 0 1.5rem 0', color: 'var(--primary-blue)', textAlign: 'center' }}>เปรียบเทียบสเปคฟิล์ม</h2>
            
            {compareList.length < 3 && (
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', position: 'relative' }}>
                <button 
                  onClick={() => setIsCompareDropdownOpen(!isCompareDropdownOpen)}
                  style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--primary-blue)', backgroundColor: 'white', color: 'var(--primary-blue)', outline: 'none', width: '100%', maxWidth: '300px', fontSize: '0.95rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span>+ เลือกรุ่นฟิล์มเปรียบเทียบ ({compareList.length}/3)</span>
                  <span style={{ transform: isCompareDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>▼</span>
                </button>
                
                {isCompareDropdownOpen && (
                  <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '300px', backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '8px', marginTop: '4px', zIndex: 10002, maxHeight: '250px', overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'left' }}>
                    {series.filter(s => s.groupId === 'g1').map(s => {
                      const seriesModels = models.filter(m => m.seriesId === s.id);
                      if (seriesModels.length === 0) return null;
                      return (
                        <div key={s.id}>
                          <div style={{ padding: '0.5rem 1rem', backgroundColor: '#f5f7fa', fontSize: '0.8rem', fontWeight: 'bold', color: '#555', position: 'sticky', top: 0, zIndex: 1 }}>{s.title}</div>
                          {seriesModels.map(m => {
                            const isSelected = compareList.some(c => c.id === m.id);
                            return (
                              <label key={m.id} style={{ display: 'flex', alignItems: 'center', padding: '0.6rem 1rem', borderBottom: '1px solid #f0f0f0', cursor: 'pointer', backgroundColor: isSelected ? '#f0f8ff' : 'white', margin: 0 }}>
                                <input 
                                  type="checkbox" 
                                  checked={isSelected}
                                  onChange={() => handleToggleCompare(m)}
                                  style={{ marginRight: '10px', transform: 'scale(1.2)' }}
                                />
                                <span style={{ fontSize: '0.9rem', color: isSelected ? 'var(--primary-blue)' : '#333', fontWeight: isSelected ? 'bold' : 'normal' }}>{m.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            

            {(() => {
              const hasSHGC = compareList.some(m => m.shgc && String(m.shgc).trim() !== '-');
              const hasVLT = compareList.some(m => m.vlt && String(m.vlt).trim() !== '-');
              const hasVLR = compareList.some(m => (m.vlr && String(m.vlr).trim() !== '-') || (m.reflectance && String(m.reflectance).trim() !== '-'));
              const hasUV = compareList.some(m => m.uv && String(m.uv).trim() !== '-');
              const hasIR = compareList.some(m => m.ir && String(m.ir).trim() !== '-');
              const hasTSER = compareList.some(m => m.tser && String(m.tser).trim() !== '-');
              const hasThickness = compareList.some(m => m.thickness && String(m.thickness).trim() !== '-');
              
              const specsConfig = compareList.length === 0 ? [
                { key: 'shgc', label: 'SHGC' },
                { key: 'vlt', label: 'แสงส่องผ่าน (VLT)' },
                { key: 'vlr', label: 'การสะท้อน (VLR)' },
                { key: 'uv', label: 'กัน UV' },
                { key: 'ir', label: 'กันความร้อน IR' },
                { key: 'tser', label: 'ลดความร้อนรวม (TSER)' },
                { key: 'thickness', label: 'ความหนา' }
              ] : [
                hasSHGC && { key: 'shgc', label: 'SHGC' },
                hasVLT && { key: 'vlt', label: 'แสงส่องผ่าน (VLT)' },
                hasVLR && { key: 'vlr', label: 'การสะท้อน (VLR)' },
                hasUV && { key: 'uv', label: 'กัน UV' },
                hasIR && { key: 'ir', label: 'กันความร้อน IR' },
                hasTSER && { key: 'tser', label: 'ลดความร้อนรวม (TSER)' },
                hasThickness && { key: 'thickness', label: 'ความหนา' }
              ].filter(Boolean);

              return (
                <>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="specs-table-real" style={{ width: '100%', minWidth: '500px', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ backgroundColor: 'var(--bg-light)', borderBottom: '2px solid var(--primary-blue)' }}>
                          <th style={{ padding: '1rem', textAlign: 'left', width: '120px' }}>สเปค</th>
                          {compareList.map(m => (
                            <th key={m.id} style={{ padding: '1rem', color: 'var(--primary-blue)' }}>
                              <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{m.name}</div>
                              <button onClick={() => setCompareList(prev => prev.filter(c => c.id !== m.id))} style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer' }}>ลบออก</button>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {specsConfig.map((spec, idx) => (
                          <tr key={spec.key} style={{ borderBottom: '1px solid #eee', backgroundColor: idx % 2 === 0 ? 'white' : '#fcfcfc' }}>
                            <td style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#555' }}>{spec.label}</td>
                            {compareList.map(m => {
                              const val = spec.key === 'vlr' && (!m.vlr || String(m.vlr).trim() === '-') ? m.reflectance : m[spec.key];
                              return (
                                <td key={`${m.id}-${spec.key}`} style={{ padding: '1rem' }}>
                                  {val && String(val).trim() !== '-' ? val : '-'}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {compareList.length > 0 && (
                    <div style={{ marginTop: '1.5rem', padding: '1.2rem', backgroundColor: '#f5f7fa', borderRadius: '12px', fontSize: '0.85rem', color: '#555', border: '1px solid #eaeaea', textAlign: 'left' }}>
                      <h4 style={{ margin: '0 0 0.8rem 0', color: 'var(--primary-blue)', fontSize: '0.95rem' }}>คำอธิบายค่าคุณสมบัติฟิล์ม</h4>
                      <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {hasSHGC && <li><strong>SHGC (ค่าสัมประสิทธิ์การส่งผ่านความร้อน):</strong> ยิ่งต่ำ ยิ่งกันความร้อนได้ดี</li>}
                        {hasVLT && <li><strong>VLT (% แสงส่องผ่าน):</strong> ยิ่งสูง ฟิล์มยิ่งสว่าง มองเห็นได้ชัดเจน</li>}
                        {hasVLR && <li><strong>VLR (% แสงสะท้อน):</strong> ยิ่งสูง กระจกยิ่งสะท้อนแสงมาก</li>}
                        {hasUV && <li><strong>UV (ป้องกันรังสีอัลตราไวโอเลต):</strong> ยิ่งสูง ยิ่งป้องกันรังสียูวี ปกป้องผิวและเฟอร์นิเจอร์</li>}
                        {hasIR && <li><strong>IR (ป้องกันรังสีอินฟราเรด):</strong> ยิ่งสูง ยิ่งกันรังสีความร้อนอินฟราเรดได้ดี</li>}
                        {hasTSER && <li><strong>TSER (ลดพลังงานความร้อนรวม):</strong> ยิ่งสูง ยิ่งกันความร้อนรวมจากแสงอาทิตย์ได้ดี</li>}
                        {hasThickness && <li><strong>ความหนา:</strong> หน่วยเป็น Mil (1 Mil = 0.0254 มม.)</li>}
                      </ul>
                    </div>
                  )}
                  {compareList.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>ยังไม่ได้เลือกฟิล์มเปรียบเทียบ<br/><span style={{ fontSize: '0.85rem' }}>(สามารถเลือกฟิล์มจากเมนูด้านบนได้เลยครับ)</span></div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

export default MainApp;
