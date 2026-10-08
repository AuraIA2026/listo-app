const fs = require('fs');

const content = fs.readFileSync('E:/Listo/src/pages/MandamePage.jsx', 'utf8');
const lines = content.split('\n');

lines.forEach((line, idx) => {
  if (line.includes('customizeModalImgIndex')) {
    console.log(`L${idx + 1}: ${line.trim()}`);
  }
});
