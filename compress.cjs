const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
ffmpeg.setFfmpegPath(ffmpegPath);
const path = require('path');
const fs = require('fs');

const inputDir = 'C:\\Users\\13900K\\Desktop\\videos';
const outputDir = 'e:\\Listo\\public\\videos';

const files = [
  'profesionales3.mp4',
  'reserva1.mp4',
  'reserva2.mp4'
];

async function processVideo(file) {
  return new Promise((resolve, reject) => {
    console.log(`Processing ${file}...`);
    const inPath = path.join(inputDir, file);
    const outPath = path.join(outputDir, file);
    
    ffmpeg(inPath)
      .outputOptions([
        '-c:v libx264',
        '-crf 28',         // Compresión fuerte adecuada para móviles
        '-preset fast',
        '-t 12',           // 12 segundos máximo (perfecto para intro)
        '-an',             // Remover audio (lo usamos muted de todos modos)
        '-vf scale=-2:720' // Reducir resolución a 720p para móviles
      ])
      .on('end', () => {
        console.log(`Finished ${file}`);
        resolve();
      })
      .on('error', (err) => {
        console.error(`Error processing ${file}:`, err);
        reject(err);
      })
      .save(outPath);
  });
}

async function main() {
  for (const file of files) {
    if (fs.existsSync(path.join(inputDir, file))) {
      await processVideo(file);
    } else {
      console.log(`File not found: ${file}`);
    }
  }
}

main().then(() => console.log('All done!')).catch(console.error);
