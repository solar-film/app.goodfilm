
with open('src/CatalogManager.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace(
    'function CatalogManager({ groupsList, seriesList, modelsList, onRefresh, onDelete }) {',
    'function CatalogManager({ allowedGroupIds, groupsList, seriesList, modelsList, onRefresh, onDelete }) {\n  const availableGroups = allowedGroupIds ? groupsList.filter(g => allowedGroupIds.includes(g.id)) : groupsList;\n  const defaultGroupId = allowedGroupIds ? allowedGroupIds[0] : \'g1\';'
)

code = code.replace(
    'useState({ title: \'\', desc: \'\', longDesc: \'\', groupId: \'g1\' });',
    'useState({ title: \'\', desc: \'\', longDesc: \'\', groupId: defaultGroupId });'
)

code = code.replace(
    'const matchGroup = filterGroup === \'\' || s.groupId === filterGroup;',
    'const matchGroup = filterGroup === \'\' ? (allowedGroupIds ? allowedGroupIds.includes(s.groupId) : true) : s.groupId === filterGroup;'
)

code = code.replace('groupsList?.map', 'availableGroups?.map')
code = code.replace('groupsList.map', 'availableGroups.map')

with open('src/CatalogManager.jsx', 'w', encoding='utf-8') as f:
    f.write(code)

print('Patched CatalogManager.jsx')

