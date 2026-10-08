const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walk('./src');

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    if (line.includes('PEDIDOS LISTO') || line.includes('MÁNDAME') || line.includes('Mandame') || line.includes('mandame')) {
      if (line.trim().length > 0 && line.trim().length < 160) {
        console.log(`${file}:${idx + 1} -> ${line.trim()}`);
      }
    }
  });
});
