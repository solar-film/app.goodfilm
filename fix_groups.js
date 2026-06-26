const fs = require('fs');
let c = fs.readFileSync('src/AdminPanel.jsx', 'utf8');

// 1. Add state for groupsList
c = c.replace('const [seriesList, setSeriesList] = useState([]);', 'const [groupsList, setGroupsList] = useState([]);\n  const [seriesList, setSeriesList] = useState([]);');

// 2. Fetch groupsList
c = c.replace('fetch(`https://nas.goodfilmshop.com/series`).then(r => r.json()).then(setSeriesList);', 'fetch(`https://nas.goodfilmshop.com/groups`).then(r => r.json()).then(setGroupsList);\n    fetch(`https://nas.goodfilmshop.com/series`).then(r => r.json()).then(setSeriesList);');

// 3. Pass groupsList
c = c.replace('<CatalogManager \n            seriesList={seriesList} \n            modelsList={modelsList}', '<CatalogManager \n            groupsList={groupsList}\n            seriesList={seriesList} \n            modelsList={modelsList}');

// 4. Update CatalogManager props
c = c.replace('function CatalogManager({ seriesList, modelsList, onRefresh, onDelete }) {', 'function CatalogManager({ groupsList, seriesList, modelsList, onRefresh, onDelete }) {');

// 5. Update editSeriesData initial state
c = c.replace(const [editSeriesData, setEditSeriesData] = useState({ title: '', desc: '', longDesc: '' });, const [editSeriesData, setEditSeriesData] = useState({ title: '', desc: '', longDesc: '', groupId: '' }););

// 6. Update handleEditSeriesClick (it might be inline)
// Let's search for setEditSeriesData in the render loop.
c = c.replace(setEditSeriesData({ title: series.title, desc: series.desc, longDesc: series.longDesc || '' });, setEditSeriesData({ title: series.title, desc: series.desc, longDesc: series.longDesc || '', groupId: series.groupId || 'g1' }););

// 7. Update Add Series form
const addFormTarget =               <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '500' }}>???? Series</label>
                <input type="text" value={newSeries.title} onChange={e => setNewSeries({...newSeries, title: e.target.value})} required className="form-control" />
              </div>
              <div style={{ flex: 2 }}>;
const addFormReplacement =               <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '500' }}>???? Series</label>
                <input type="text" value={newSeries.title} onChange={e => setNewSeries({...newSeries, title: e.target.value})} required className="form-control" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '500' }}>?????</label>
                <select value={newSeries.groupId} onChange={e => setNewSeries({...newSeries, groupId: e.target.value})} required className="form-control">
                  {groupsList?.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
                </select>
              </div>
              <div style={{ flex: 2 }}>;
c = c.replace(addFormTarget, addFormReplacement);

// 8. Update Edit Series form
const editFormTarget = <input type="text" value={editSeriesData.desc} onChange={e => setEditSeriesData({...editSeriesData, desc: e.target.value})} className="form-control" placeholder="?????????????" />;
const editFormReplacement = <input type="text" value={editSeriesData.desc} onChange={e => setEditSeriesData({...editSeriesData, desc: e.target.value})} className="form-control" placeholder="?????????????" />
                    <select value={editSeriesData.groupId} onChange={e => setEditSeriesData({...editSeriesData, groupId: e.target.value})} className="form-control">
                      {groupsList?.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
                    </select>;
c = c.replace(editFormTarget, editFormReplacement);

fs.writeFileSync('src/AdminPanel.jsx', c, 'utf8');
