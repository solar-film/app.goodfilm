const fs = require('fs');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

async function extractText() {
  const pdfPath = 'public/assets/bostik/presentation.pdf';
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const pdf = await pdfjsLib.getDocument({data: data}).promise;
  const numPages = pdf.numPages;

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const text = textContent.items.map(item => item.str).join(' ');
    
    if (text.toLowerCase().includes('extrusion rate') || 
        text.toLowerCase().includes('density') || 
        text.toLowerCase().includes('shore-a') ||
        text.toLowerCase().includes('tensile strength') ||
        text.toLowerCase().includes('elongation') ||
        text.toLowerCase().includes('page 25') ||
        text.toLowerCase().includes('page 27')) {
      console.log(`Physical Page ${i}: ${text.substring(0, 100)}...`);
    }
  }
}

extractText().catch(console.error);
