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

async function optimizeBundle() {
  const assetsDir = path.join('E:', 'Listo', 'android', 'app', 'src', 'main', 'assets');
  
  // 1. Eliminar archivos pesados que ahora se sirven desde Vercel CDN
  const filesToRemove = [
    'navidad_monumento.mp4',
    'todos_los_profesionales.mp4',
    'delivery_worker_scooter.mp4',
    'delivery_rider_video.mp4',
    'intro_app2.mp3'
  ];

  let removedBytes = 0;
  walkDir(assetsDir, (filePath) => {
    const filename = path.basename(filePath);
    if (filesToRemove.includes(filename)) {
      try {
        const size = fs.statSync(filePath).size;
        fs.unlinkSync(filePath);
        removedBytes += size;
        console.log(`  🗑️ Eliminado del paquete local (se carga desde CDN): ${filename} (${(size / (1024 * 1024)).toFixed(2)} MB)`);
      } catch (e) {}
    }
  });

  if (removedBytes > 0) {
    console.log(`✨ Ahorro por videos/audios CDN: ${(removedBytes / (1024 * 1024)).toFixed(2)} MB`);
  }

  // 2. Optimizar imágenes mayores a 60KB
  let filesToProcess = [];
  walkDir(assetsDir, (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
      const stat = fs.statSync(filePath);
      if (stat.size > 60 * 1024) { // over 60kb
        filesToProcess.push(filePath);
      }
    }
  });

  console.log(`Encontradas ${filesToProcess.length} imágenes para optimizar (>60KB)...`);

  for (const filePath of filesToProcess) {
    const stat = fs.statSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const tempPath = filePath + '.tmp';

    try {
      const meta = await sharp(filePath).metadata();
      let pipeline = sharp(filePath);
      
      // Limitar ancho a 1200px para que no ocupen memoria excesiva
      if (meta.width && meta.width > 1200) {
        pipeline = pipeline.resize({ width: 1200, withoutEnlargement: true });
      }

      if (ext === '.png') {
        if (meta.hasAlpha) {
          await pipeline.png({ quality: 80, compressionLevel: 9 }).toFile(tempPath);
        } else {
          await pipeline.jpeg({ quality: 75, mozjpeg: true }).toFile(tempPath);
        }
      } else {
        await pipeline.jpeg({ quality: 75, mozjpeg: true }).toFile(tempPath);
      }

      const newSize = fs.statSync(tempPath).size;
      if (newSize < stat.size) {
        fs.unlinkSync(filePath);
        fs.renameSync(tempPath, filePath);
        console.log(`  ¡Reducido! ${path.basename(filePath)}: ${(stat.size / 1024).toFixed(0)} KB -> ${(newSize / 1024).toFixed(0)} KB`);
      } else {
        fs.unlinkSync(tempPath);
      }
    } catch (err) {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      console.error(`Error optimizando ${filePath}:`, err.message);
    }
  }
}

optimizeBundle().then(() => console.log('Finalizada la optimización del bundle Android.'));
