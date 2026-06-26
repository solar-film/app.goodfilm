const fs = require('fs');

const mainAppPath = 'src/MainApp.jsx';
let content = fs.readFileSync(mainAppPath, 'utf8');

// 1. Add Youtube import
content = content.replace("from 'lucide-react';", ", Youtube } from 'lucide-react';");

// 2. Add videosList state
const stateTarget = "const [bannersList, setBannersList] = useState([]);";
content = content.replace(stateTarget, `${stateTarget}\n  const [videosList, setVideosList] = useState([]);`);

// 3. Update fetchData
const fetchTarget = `      apiFetch(\`/banners?_=\${ts}\`).then(res => { if (!res.ok) throw new Error('banners'); return res.json(); })`;
const fetchReplacement = `      apiFetch(\`/banners?_=\${ts}\`).then(res => { if (!res.ok) throw new Error('banners'); return res.json(); }),\n      apiFetch(\`/videos?_=\${ts}\`).then(res => { if (!res.ok) throw new Error('videos'); return res.json(); })`;
content = content.replace(fetchTarget, fetchReplacement);

const awaitTarget = `const [groupsData, seriesData, modelsData, portfolioData, downloadsData, bannersData] = await Promise.all([`;
if (content.includes(awaitTarget)) {
   content = content.replace(awaitTarget, `const [groupsData, seriesData, modelsData, portfolioData, downloadsData, bannersData, videosData] = await Promise.all([`);
   content = content.replace(`setBannersList(bannersData);`, `setBannersList(bannersData);\n      setVideosList(videosData);`);
} else {
    // maybe it is something else, let's use a generic replace
    const destructureTarget = /const \[groupsData, seriesData, modelsData, portfolioData, downloadsData, bannersData\] = await Promise\.all\(([\s\S]*?)\);/;
    content = content.replace(destructureTarget, (match, p1) => {
        return `const [groupsData, seriesData, modelsData, portfolioData, downloadsData, bannersData, videosData] = await Promise.all(${p1});`;
    });
    content = content.replace(`setBannersList(bannersData);`, `setBannersList(bannersData);\n      setVideosList(videosData);`);
}

// 4. Inject videos render
const relatedDownloadsTarget = `{/* Related Downloads */}`;
const videosRender = `{/* Recommended Videos */}
          {(() => {
            const relatedVideos = videosList.filter(v => v.seriesId === selectedSeries.id);
            if (relatedVideos.length === 0) return null;
            return (
              <div style={{ marginBottom: '2rem' }}>
                <SectionHeader 
                  icon={Youtube} 
                  title="วิดีโอแนะนำ" 
                />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                  {relatedVideos.map(video => (
                    <div key={video.id} className="premium-card" style={{ overflow: 'hidden', borderRadius: '12px' }}>
                      <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', backgroundColor: '#000' }}>
                        <iframe
                          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                          src={\`https://www.youtube.com/embed/\${video.youtubeId}\`}
                          title={video.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                      <div style={{ padding: '1rem', backgroundColor: '#fff' }}>
                        <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-dark)' }}>{video.title}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
          
          `;

content = content.replace(relatedDownloadsTarget, videosRender + relatedDownloadsTarget);

fs.writeFileSync(mainAppPath, content, 'utf8');
console.log("MainApp.jsx updated.");
