const fs = require('fs');

const content = fs.readFileSync('E:/Listo/src/pages/MandamePage.jsx', 'utf8');
const lines = content.split('\n');

lines.forEach((line, idx) => {
  if (line.includes('onClick') || line.includes('activeStoreModal') || line.includes('customizeProduct') || line.includes('isCartModalOpen') || line.includes('handleAddToCart') || line.includes('checkout')) {
    if (line.trim().length > 0 && line.trim().length < 150) {
      console.log(`L${idx + 1}: ${line.trim()}`);
    }
  }
});
