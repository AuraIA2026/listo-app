const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const dirPath = path.join('E:', 'Listo', 'public', 'assets');

async function optimizeImages() {
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    if (file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png')) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      
      // If larger than 500 KB
      if (stat.size > 500 * 1024) {
        console.log(`Optimizando: ${file} (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);
        const tempPath = path.join(dirPath, 'temp_' + file);
        
        try {
          await sharp(filePath)
            .resize(800) // max width 800px (sufficient for mobile app gallery)
            .jpeg({ quality: 70 })
            .toFile(tempPath);
            
          // Replace original
          fs.unlinkSync(filePath);
          fs.renameSync(tempPath, filePath);
          console.log(`¡Hecho! -> ${(fs.statSync(filePath).size / 1024).toFixed(2)} KB`);
        } catch (err) {
          console.error(`Error optimizando ${file}:`, err);
        }
      }
    }
  }
}

optimizeImages().then(() => console.log('Finalizado la optimización de imágenes.'));
