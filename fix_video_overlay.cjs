const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'BostikPage.jsx');
let content = fs.readFileSync(file, 'utf8');

const targetStr1 = `const VIDEO_MAPPING = {
  25: { file: 'media5.mp4', label: 'Extrusion Rate Test' },
  26: { file: 'media6.mp4', label: 'Density Test' },
  27: { file: 'media9.mp4', label: 'Shore-A Hardness Test' },
  28: { file: 'media7.MP4', label: 'Tensile Strength Test' },
  29: { file: 'media1.mp4', label: 'Elongation at Break Test' },
  30: { file: 'media8.mp4', label: 'E-Modulus Test' },
  31: { file: 'media2.mp4', label: 'Tack-free Time Test' },
  32: { file: 'media3.mp4', label: 'Adhesion in Peel Test' },
  33: { file: 'media4.mp4', label: 'Movement Capability Test' },
};`;

const replacementStr1 = `const VIDEO_MAPPING = {
  25: { file: 'media5.mp4', label: 'Extrusion Rate Test', style: { top: '15.5%', left: '32.5%', width: '63.75%', height: '68.8%' } },
  26: { file: 'media6.mp4', label: 'Density Test', style: { top: '15.5%', left: '32.5%', width: '63.75%', height: '68.8%' } },
  27: { file: 'media9.mp4', label: 'Shore-A Hardness Test', style: { top: '15.5%', left: '32.5%', width: '63.75%', height: '68.8%' } },
  28: { file: 'media7.MP4', label: 'Tensile Strength Test', style: { top: '15.5%', left: '32.5%', width: '63.75%', height: '68.8%' } },
  29: { file: 'media1.mp4', label: 'Elongation at Break Test', style: { top: '15.5%', left: '32.5%', width: '63.75%', height: '68.8%' } },
  30: { file: 'media8.mp4', label: 'E-Modulus Test', style: { top: '23%', left: '49%', width: '48%', height: '53%' } },
  31: { file: 'media4.mp4', label: 'Movement Capability Test', style: { top: '35%', left: '5%', width: '55%', height: '60%' } },
};`;

const targetStr2 = `                    style={{
                      position: 'absolute',
                      top: '15.5%',
                      left: '32.5%',
                      width: '63.75%',
                      height: '68.8%',
                      backgroundColor: '#000',`;

const replacementStr2 = `                    style={{
                      position: 'absolute',
                      ...(videoData.style || { top: '15.5%', left: '32.5%', width: '63.75%', height: '68.8%' }),
                      backgroundColor: '#000',`;

if (content.includes(targetStr1) && content.includes(targetStr2)) {
  content = content.replace(targetStr1, replacementStr1);
  content = content.replace(targetStr2, replacementStr2);
  fs.writeFileSync(file, content, 'utf8');
  console.log("Patched successfully!");
} else {
  console.log("Target string not found!");
}
