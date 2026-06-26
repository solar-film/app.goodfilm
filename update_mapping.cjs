const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'BostikPage.jsx');
let content = fs.readFileSync(file, 'utf8');

const mappingRegex = /const VIDEO_MAPPING = \{[\s\S]*?\};/;

const newMapping = `const VIDEO_MAPPING = {
  3: { file: 'media1.mp4', label: 'Video', style: { top: '15.5%', left: '32.5%', width: '63.75%', height: '68.8%' } },
  25: { file: 'media2.mp4', label: 'Video', style: { top: '15.5%', left: '32.5%', width: '63.75%', height: '68.8%' } },
  26: { file: 'media3.mp4', label: 'Video', style: { top: '15.5%', left: '32.5%', width: '63.75%', height: '68.8%' } },
  27: { file: 'media4.mp4', label: 'Video', style: { top: '15.5%', left: '32.5%', width: '63.75%', height: '68.8%' } },
  28: { file: 'media5.mp4', label: 'Video', style: { top: '15.5%', left: '32.5%', width: '63.75%', height: '68.8%' } },
  29: { file: 'media6.mp4', label: 'Video', style: { top: '15.5%', left: '32.5%', width: '63.75%', height: '68.8%' } },
  31: { file: 'media7.MP4', label: 'Video', style: { top: '15%', left: '33%', width: '64%', height: '70%' } },
  33: { file: 'media8.mp4', label: 'Video', style: { top: '35%', left: '5%', width: '55%', height: '60%' } },
  44: { file: 'media9.mp4', label: 'Video', style: { top: '15.5%', left: '32.5%', width: '63.75%', height: '68.8%' } },
};`;

if (content.match(mappingRegex)) {
  content = content.replace(mappingRegex, newMapping);
  fs.writeFileSync(file, content, 'utf8');
  console.log("Updated VIDEO_MAPPING successfully!");
} else {
  console.log("Could not find VIDEO_MAPPING in the file.");
}
