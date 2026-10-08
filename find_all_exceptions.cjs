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
    const lNum = idx + 1;

    // Check .split(
    if (line.includes('.split(') && !line.includes('typeof') && !line.includes('?') && !line.includes('||')) {
      // Ignore string literals like 'a b'.split(' ')
      if (!line.match(/['"][^'"]*['"]\.split\(/)) {
        console.log(`[RISK SPLIT] ${file}:${lNum} -> ${line.trim()}`);
      }
    }

    // Check .toLowerCase( or .toUpperCase(
    if ((line.includes('.toLowerCase(') || line.includes('.toUpperCase(')) && !line.includes('typeof') && !line.includes('?') && !line.includes('||') && !line.includes('&&')) {
      if (!line.match(/['"][^'"]*['"]\.(toLowerCase|toUpperCase)\(/)) {
        console.log(`[RISK CASE CONVERT] ${file}:${lNum} -> ${line.trim()}`);
      }
    }

    // Check .toFixed(
    if (line.includes('.toFixed(') && !line.includes('typeof') && !line.includes('?') && !line.includes('||') && !line.includes('Number(')) {
      console.log(`[RISK TOFIXED] ${file}:${lNum} -> ${line.trim()}`);
    }

    // Check unquoted style values (e.g. justifyContent: spaceBetween)
    if (line.includes('justifyContent:') || line.includes('alignItems:') || line.includes('flexDirection:')) {
      const match = line.match(/(justifyContent|alignItems|flexDirection)\s*:\s*([a-zA-Z0-9_$]+)/);
      if (match) {
        const v = match[2];
        if (['spaceBetween', 'spaceAround', 'spaceEvenly', 'flexStart', 'flexEnd'].includes(v)) {
          console.log(`[STYLE BUG] ${file}:${lNum} (${match[0]}) -> ${line.trim()}`);
        }
      }
    }
  });
});
