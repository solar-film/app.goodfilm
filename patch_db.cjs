const fs = require('fs');
const path = '//NAS_GFS71022/docker/good-film-app/db.json';

let db = JSON.parse(fs.readFileSync(path, 'utf8'));

const mapping = {
  '1781517077743': 'ca',
  '1781518701083': 'prex',
  '1781518740988': 'pr',
  '1781518772889': 'nv',
  '1781518788989': 'cmir',
  '1781518808876': 'x',
  '1781518857994': 'bc',
  '1781519041176': '7725',
  '1781519100619': '5525',
  '1781588851213': '5525',
  '1781588867770': '7725',
  '1781589515247': 'pr',
  '1781589527069': 'pr',
  '1781589536460': 'pr',
  '1781589546222': 'pr'
};

db.downloads = db.downloads.map(d => {
  if (mapping[d.id]) {
    d.seriesId = mapping[d.id];
  }
  return d;
});

fs.writeFileSync(path, JSON.stringify(db, null, 2));
console.log('Successfully patched db.json!');
