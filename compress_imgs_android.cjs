const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
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
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
      const stat = fs.statSync(filePath);
      if (stat.size > 150 * 1024) { // over 150kb
        filesToProcess.push(filePath);
      }
    }
  });

  console.log(`Encontrados ${filesToProcess.length} imágenes para optimizar...`);

  for (const filePath of filesToProcess) {
    const stat = fs.statSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    console.log(`Optimizando: ${path.basename(filePath)} (${(stat.size / 1024).toFixed(0)} KB)`);
    const tempPath = filePath + '.tmp';

    try {
      const meta = await sharp(filePath).metadata();
      let pipeline = sharp(filePath);
      
      // Resize if exceptionally huge width
      if (meta.width && meta.width > 1200) {
        pipeline = pipeline.resize({ width: 1200, withoutEnlargement: true });
      }

      if (ext === '.png') {
        if (meta.hasAlpha) {
          await pipeline.png({ quality: 80, compressionLevel: 9 }).toFile(tempPath);
        } else {
          // No transparency: convert to jpeg or high-compression png
          await pipeline.jpeg({ quality: 75, mozjpeg: true }).toFile(tempPath);
        }
      } else {
        await pipeline.jpeg({ quality: 70, mozjpeg: true }).toFile(tempPath);
      }

      const newSize = fs.statSync(tempPath).size;
      if (newSize < stat.size) {
        fs.unlinkSync(filePath);
        fs.renameSync(tempPath, filePath);
        console.log(`  ¡Reducido! ${(stat.size / 1024).toFixed(0)} KB -> ${(newSize / 1024).toFixed(0)} KB`);
      } else {
        fs.unlinkSync(tempPath);
        console.log(`  Mantenido original (ya óptimo)`);
      }
    } catch (err) {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      console.error(`Error optimizando ${filePath}:`, err.message);
    }
  }
}

optimizeImages().then(() => console.log('Finalizado la optimización de imágenes en el bundle Android.'));
