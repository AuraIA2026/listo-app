const fs = require('fs');

const content = fs.readFileSync('E:/Listo/src/pages/HomePage.jsx', 'utf8');
const lines = content.split('\n');

lines.forEach((line, idx) => {
  if (line.includes('onClick') || line.includes('navigate(')) {
    if (line.trim().length > 0 && line.trim().length < 160) {
      console.log(`L${idx + 1}: ${line.trim()}`);
    }
  }
});
