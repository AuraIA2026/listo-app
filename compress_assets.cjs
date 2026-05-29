const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Directorio raíz de los recursos en React
const publicAssetsDir = path.join('E:', 'Listo', 'public', 'assets');

// Función para recorrer directorios de forma recursiva
function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

async function optimizeImages() {
  let filesToProcess = [];

  // Buscar archivos grandes (más de 100 KB) recursivamente
  walkDir(publicAssetsDir, (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
      const stat = fs.statSync(filePath);
      if (stat.size > 100 * 1024) { // mayor a 100 KB
        filesToProcess.push({ filePath, ext, size: stat.size });
      }
    }
  });

  console.log(`Se encontraron ${filesToProcess.length} imágenes grandes para optimizar.`);

  for (const item of filesToProcess) {
    const { filePath, ext, size } = item;
    console.log(`Optimizando: ${path.basename(filePath)} (${(size / 1024 / 1024).toFixed(2)} MB)`);
    const tempPath = filePath + '.tmp';
    
    try {
      let pipeline = sharp(filePath);
      
      // Dado que son iconos grandes de profesionales, un tamaño de 250px es excelente 
      // (actualmente se muestran a 48px en la pantalla)
      pipeline = pipeline.resize({ width: 250, withoutEnlargement: true });

      if (ext === '.png') {
        // Optimizar PNG manteniendo la transparencia
        await pipeline
          .png({ compressionLevel: 9, quality: 70 })
          .toFile(tempPath);
      } else {
        // Optimizar JPEG/JPG
        await pipeline
          .jpeg({ quality: 75 })
          .toFile(tempPath);
      }
        
      fs.unlinkSync(filePath);
      fs.renameSync(tempPath, filePath);
      
      const newSize = fs.statSync(filePath).size;
      console.log(`¡Completado! -> ${path.basename(filePath)} reducido de ${(size / 1024).toFixed(1)} KB a ${(newSize / 1024).toFixed(1)} KB`);
    } catch (err) {
      console.error(`Error optimizando ${filePath}:`, err);
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    }
  }
}

optimizeImages().then(() => {
  console.log('--- ¡Optimización de imágenes finalizada con éxito! ---');
}).catch(console.error);
