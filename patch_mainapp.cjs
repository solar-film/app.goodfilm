const fs = require('fs');
let content = fs.readFileSync('src/MainApp.jsx', 'utf8');

const targetStr = {groups.map((group) => {;
const replaceStr = 
          {groups.filter(g => g.id !== 'g6').length > 0 && (
            <div className="section-header" style={{ marginBottom: '1.2rem' }}>
              <h2 style={{ fontSize: '1.35rem', color: 'var(--primary-blue)', fontWeight: 'bold' }}>กลุ่มผลิตภัณฑ์ฟิล์ม 3M</h2>
            </div>
          )}
          {groups.filter(g => g.id !== 'g6').map((group) => {;

content = content.replace(targetStr, replaceStr);

const targetStr2 =             );
          })}
        </div>
        )}
      </div>;

const replaceStr2 =             );
          })}

          {groups.filter(g => g.id === 'g6').length > 0 && (
            <div className="section-header" style={{ marginBottom: '1.2rem', marginTop: '2rem' }}>
              <h2 style={{ fontSize: '1.35rem', color: 'var(--primary-blue)', fontWeight: 'bold' }}>ผลิตภัณฑ์ยาแนวและโฟม Bostik</h2>
            </div>
          )}
          {groups.filter(g => g.id === 'g6').map((group) => {
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
                <div className={'accordion-content ' + (isExpanded ? 'expanded' : '')}>
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
                                  <div style={{ backgroundColor: 'white', border: '1px solid #E0E0E0', color: 'var(--primary-red)', width: '45px', height: '45px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '1rem', flexShrink: 0, textAlign: 'center', lineHeight: '1.1' }}>
                                    <span style={{ fontSize: group.id === 'g6' ? '0.75rem' : '1rem', color: group.id === 'g6' ? '#003DA5' : 'var(--primary-red)' }}>{group.id === 'g6' ? 'Bostik' : '3M'}</span>
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
                                <div className={'accordion-content ' + (isSeriesExpanded ? 'expanded' : '')}>
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
                                            ดูรายละเอียดเพิ่มเติมทั้งหมด
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
                        <div style={{ padding: '1.5rem 0', color: 'var(--text-muted)', fontSize: '1.1rem', textAlign: 'center' }}>ไม่พบข้อมูลซีรีส์ในกลุ่มนี้</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>;

content = content.replace(targetStr2, replaceStr2);
fs.writeFileSync('src/MainApp.jsx', content);
