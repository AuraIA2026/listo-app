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
    // Check unquoted style values like justifyContent: spaceBetween, spaceAround, flexStart, etc.
    if (['spaceBetween', 'spaceAround', 'spaceEvenly', 'flexStart', 'flexEnd', 'column', 'row', 'absolute', 'relative', 'fixed', 'sticky', 'pointer', 'hidden', 'scroll'].some(v => line.includes(v))) {
      const match = line.match(/(justifyContent|alignItems|flexDirection|textAlign|position|display)\s*:\s*([a-zA-Z0-9_$]+)/);
      if (match) {
        const val = match[2];
        if (['spaceBetween', 'spaceAround', 'spaceEvenly', 'flexStart', 'flexEnd', 'column', 'row', 'absolute', 'relative', 'fixed', 'sticky', 'pointer', 'hidden', 'scroll'].includes(val)) {
          console.log(`[STYLE BUG] ${file}:${idx + 1} -> ${line.trim()}`);
        }
      }
    }

    // Check potential unsafe dereferences like .map on undefined properties
    if (line.includes('.map(') || line.includes('.filter(') || line.includes('.reduce(') || line.includes('.find(')) {
      if (line.match(/(options|sides|extras|categories|products|items|orders|reviews|comments|ratings|banners|dishes|tags)\.map\(/)) {
        if (!line.includes('?') && !line.includes('Array.isArray') && !line.includes('||')) {
          console.log(`[POTENTIAL UNPROTECTED MAP] ${file}:${idx + 1} -> ${line.trim()}`);
        }
      }
    }
  });
});
