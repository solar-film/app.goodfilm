import fs from 'fs';
import path from 'path';

const files = [
  'db.json',
  'data/database.json'
];

for (const file of files) {
  const filePath = path.resolve(file);
  if (fs.existsSync(filePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (!data.videos) {
        data.videos = [];
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`Added 'videos' to ${file}`);
      } else {
        console.log(`'videos' already exists in ${file}`);
      }
    } catch (e) {
      console.error(`Error processing ${file}:`, e);
    }
  }
}
