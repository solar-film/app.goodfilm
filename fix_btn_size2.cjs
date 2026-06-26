const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'BostikPage.jsx');
let content = fs.readFileSync(file, 'utf8');

const targetMapping = `const VIDEO_MAPPING = {
  25: { file: 'media5.mp4', label: 'Extrusion Rate Test', style: { top: '15.5%', left: '32.5%', width: '63.75%', height: '68.8%' } },
  26: { file: 'media6.mp4', label: 'Density Test', style: { top: '15.5%', left: '32.5%', width: '63.75%', height: '68.8%' } },
  27: { file: 'media9.mp4', label: 'Shore-A Hardness Test', style: { top: '15.5%', left: '32.5%', width: '63.75%', height: '68.8%' } },
  28: { file: 'media7.MP4', label: 'Tensile Strength Test', style: { top: '15.5%', left: '32.5%', width: '63.75%', height: '68.8%' } },
  29: { file: 'media1.mp4', label: 'Elongation at Break Test', style: { top: '15.5%', left: '32.5%', width: '63.75%', height: '68.8%' } },
  30: { file: 'media8.mp4', label: 'E-Modulus Test', style: { top: '23%', left: '49%', width: '48%', height: '53%' } },
  31: { file: 'media4.mp4', label: 'Movement Capability Test', style: { top: '35%', left: '5%', width: '55%', height: '60%' } },
};`;

const replacementMapping = `const VIDEO_MAPPING = {
  25: { file: 'media5.mp4', label: 'Extrusion Rate Test', style: { top: '15.5%', left: '32.5%', width: '63.75%', height: '68.8%' } },
  26: { file: 'media6.mp4', label: 'Density Test', style: { top: '15.5%', left: '32.5%', width: '63.75%', height: '68.8%' } },
  27: { file: 'media9.mp4', label: 'Shore-A Hardness Test', style: { top: '15.5%', left: '32.5%', width: '63.75%', height: '68.8%' } },
  28: { file: 'media7.MP4', label: 'Tensile Strength Test', style: { top: '15.5%', left: '32.5%', width: '63.75%', height: '68.8%' } },
  29: { file: 'media1.mp4', label: 'Elongation at Break Test', style: { top: '15.5%', left: '32.5%', width: '63.75%', height: '68.8%' } },
  30: { file: 'media8.mp4', label: 'E-Modulus Test', style: { top: '20%', left: '48%', width: '48%', height: '60%' } },
  31: { file: 'media2.mp4', label: 'Tack-free Time Test', style: { top: '15%', left: '33%', width: '64%', height: '70%' } },
  32: { file: 'media3.mp4', label: 'Adhesion in Peel Test', style: { top: '20%', left: '42%', width: '55%', height: '60%' } },
  33: { file: 'media4.mp4', label: 'Movement Capability Test', style: { top: '35%', left: '5%', width: '55%', height: '60%' } },
};`;

if (content.includes(targetMapping)) {
  content = content.replace(targetMapping, replacementMapping);
}

// Replace the button block using regex to avoid exact spacing mismatch
content = content.replace(/className="play-btn"[\s\S]*?<PlayCircle size=\{28\} \/>/g, \`className="play-btn"
                      style={{
                        backgroundColor: 'rgba(26, 73, 147, 0.4)',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.95rem',
                        fontWeight: 'bold',
                        backdropFilter: 'blur(3px)',
                        transition: 'all 0.2s',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                      }}
                    >
                      <PlayCircle size={20} />\`);

fs.writeFileSync(file, content, 'utf8');
console.log("Patched correctly!");
