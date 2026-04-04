const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Find all heavy images recursively in android build
function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

async function optimizeImages() {
  const assetsDir = path.join('E:', 'Listo', 'android', 'app', 'src', 'main', 'assets');
  let filesToProcess = [];

  walkDir(assetsDir, (filePath) => {
    if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg') || filePath.endsWith('.png')) {
      const stat = fs.statSync(filePath);
      if (stat.size > 500 * 1024) { // over 500kb
        filesToProcess.push(filePath);
      }
    }
  });

  for (const filePath of filesToProcess) {
    const stat = fs.statSync(filePath);
    console.log(`Optimizando: ${path.basename(filePath)} (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);
    const tempPath = filePath + '.tmp';
    
    try {
      await sharp(filePath)
        .resize(1000) 
        .jpeg({ quality: 60 })
        .toFile(tempPath);
        
      fs.unlinkSync(filePath);
      fs.renameSync(tempPath, filePath);
      console.log(`¡Hecho! -> ${(fs.statSync(filePath).size / 1024).toFixed(2)} KB`);
    } catch (err) {
      console.error(`Error optimizando ${filePath}:`, err);
    }
  }
}

optimizeImages().then(() => console.log('Finalizado la optimización de imágenes en el bundle Android.'));
