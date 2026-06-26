const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const portfolioDir = path.join(publicDir, 'portfolio');
const samplesDir = path.join(publicDir, 'samples');
const dbPath = path.join(__dirname, 'db.json');

console.log('Starting migration...');

// 1. Create samples dir if it doesn't exist
if (!fs.existsSync(samplesDir)) {
  fs.mkdirSync(samplesDir, { recursive: true });
  console.log('Created directory: public/samples');
}

// 2. Move sample images
let movedCount = 0;
if (fs.existsSync(portfolioDir)) {
  const files = fs.readdirSync(portfolioDir);
  for (const file of files) {
    if (file.includes('sample-')) {
      const oldPath = path.join(portfolioDir, file);
      const newPath = path.join(samplesDir, file);
      try {
        fs.renameSync(oldPath, newPath);
        movedCount++;
      } catch (err) {
        console.error(`Error moving ${file}:`, err);
      }
    }
  }
}
console.log(`Moved ${movedCount} sample images from portfolio/ to samples/`);

// 3. Update db.json
try {
  const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  let updatedCount = 0;

  if (dbData.portfolio && Array.isArray(dbData.portfolio)) {
    for (const item of dbData.portfolio) {
      if (item.type === 'sample') {
        const fields = ['image1', 'image2', 'image3', 'image4'];
        for (const field of fields) {
          if (item[field] && item[field].startsWith('/portfolio/')) {
            item[field] = item[field].replace('/portfolio/', '/samples/');
            updatedCount++;
          }
        }
      }
    }
  }

  if (updatedCount > 0) {
    fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), 'utf8');
    console.log(`Successfully updated ${updatedCount} paths in db.json from /portfolio/ to /samples/`);
  } else {
    console.log('No database updates were necessary.');
  }
} catch (err) {
  console.error('Error updating db.json:', err);
}

console.log('Migration completed.');
