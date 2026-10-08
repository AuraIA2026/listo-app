const fs = require('fs');

const content = fs.readFileSync('E:/Listo/src/pages/HomePage.jsx', 'utf8');
const lines = content.split('\n');

lines.forEach((line, idx) => {
  if (line.includes('mandame') || line.includes('PEDIDOS LISTO') || line.includes('pedidos') || line.includes('Restaurante') || line.includes('restaurante')) {
    if (line.trim().length > 0 && line.trim().length < 160) {
      console.log(`L${idx + 1}: ${line.trim()}`);
    }
  }
});
