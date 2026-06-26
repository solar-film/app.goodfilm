import sys

with open('src/AdminPanel.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Update handleEditSeriesClick
c = c.replace(
    "setEditSeriesData({ title: series.title, desc: series.desc, longDesc: series.longDesc || '' });",
    "setEditSeriesData({ title: series.title, desc: series.desc, longDesc: series.longDesc || '', groupId: series.groupId || 'g1' });"
)

# 2. Add group dropdown to Add Series form
c = c.replace(
    '''              <div style={{ flex: 2 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '500' }}>''',
    '''              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '500' }}>??????????????</label>
                <select value={newSeries.groupId} onChange={e => setNewSeries({...newSeries, groupId: e.target.value})} required className="form-control">
                  {groupsList?.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
                </select>
              </div>
              <div style={{ flex: 2 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '500' }}>'''
)

# 3. Add group dropdown to Edit Series form
c = c.replace(
    '''                    <div style={{ backgroundColor: 'white' }}>
                      <ReactQuill theme="snow" value={editSeriesData.longDesc || ''}''',
    '''                    <select value={editSeriesData.groupId} onChange={e => setEditSeriesData({...editSeriesData, groupId: e.target.value})} className="form-control" style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                      {groupsList?.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
                    </select>
                    <div style={{ backgroundColor: 'white' }}>
                      <ReactQuill theme="snow" value={editSeriesData.longDesc || ''}'''
)

with open('src/AdminPanel.jsx', 'w', encoding='utf-8') as f:
    f.write(c)

print("Patched!")
