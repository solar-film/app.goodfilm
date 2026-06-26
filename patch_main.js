const fs = require('fs');
let c = fs.readFileSync('src/MainApp.jsx', 'utf8');

let target1 = `                              <div key={s.id} style={{ marginBottom: '0.6rem', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#f8f9fa' }}>
                                <div 
                                  onClick={(e) => { e.stopPropagation(); setExpandedSeriesId(isSeriesExpanded ? null : s.id); }}
                                  style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', cursor: 'pointer', backgroundColor: isSeriesExpanded ? '#fff' : 'transparent' }}
                                >`;

let repl1 = `                              <div key={s.id} style={{ marginBottom: '0.6rem', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#f8f9fa' }}>
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
                                >`;

let target2 = `<div style={{ transform: isSeriesExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}>
                                    <ChevronRight size={20} color="#ccc" />
                                  </div>
                                </div>
                                
                                {/* Expanded Models List */}
                                <div className={\`accordion-content \${isSeriesExpanded ? 'expanded' : ''}\`}>`;

let repl2 = `{seriesModels.length > 0 && (
                                  <div style={{ transform: isSeriesExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}>
                                    <ChevronRight size={20} color="#ccc" />
                                  </div>
                                  )}
                                </div>
                                
                                {/* Expanded Models List */}
                                {seriesModels.length > 0 && (
                                <div className={\`accordion-content \${isSeriesExpanded ? 'expanded' : ''}\`}>`;

let target3 = `                                          <div 
                                            onClick={(e) => { e.stopPropagation(); setSelectedSeries(s); }}
                                            style={{ marginTop: '0.5rem', padding: '0.8rem', textAlign: 'center', color: 'white', backgroundColor: 'var(--primary-blue)', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                                          >`;

let idx3 = c.indexOf(target3);
if (idx3 === -1) {
    console.log("Could not find target3");
    process.exit(1);
}

// Find the end of the block we want to replace
// It ends at:
//                                       )}
//                                     </div>
//                                   </div>
let target4 = `                                      )}
                                    </div>
                                  </div>`;
let idx4 = c.indexOf(target4, idx3);
if (idx4 === -1) {
    console.log("Could not find target4");
    process.exit(1);
}

let blockToReplace = c.substring(idx3, idx4 + target4.length);

let repl3 = target3 + blockToReplace.split(target3)[1]; // keep target3
// we need to remove the else block.
// Let's just do an exact string replacement for the parts we know.

// Actually it's easier to just do:
c = c.replace(target1, repl1);
c = c.replace(target2, repl2);

fs.writeFileSync('src/MainApp.jsx', c, 'utf8');
console.log("Patched part 1 and 2");
