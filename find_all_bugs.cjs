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
let foundCount = 0;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    const lNum = idx + 1;

    // 1. JSON.parse without try catch on same line or block (check if raw JSON.parse)
    if (line.includes('JSON.parse(') && !line.includes('try') && !file.includes('check_bugs')) {
      // Check if inside try catch block (simple heuristic)
      const prevBlock = lines.slice(Math.max(0, idx - 5), idx).join('\n');
      if (!prevBlock.includes('try')) {
        console.log(`[UNPROTECTED JSON.PARSE] ${file}:${lNum} -> ${line.trim()}`);
        foundCount++;
      }
    }

    // 2. Unprotected method calls on potentially undefined string/number/array properties
    // like .toFixed(), .split(), .toLowerCase(), .toUpperCase(), .slice()
    const methodMatches = line.match(/(\w+(?:\.\w+)+)\.(toFixed|split|toLowerCase|toUpperCase)\(/g);
    if (methodMatches) {
      methodMatches.forEach(m => {
        if (!line.includes('?') && !line.includes('typeof') && !line.includes('||')) {
          console.log(`[UNPROTECTED METHOD CALL] ${file}:${lNum} (${m}) -> ${line.trim()}`);
          foundCount++;
        }
      });
    }

    // 3. Destructuring or property access on potentially null/undefined props
    // e.g. navigate() call without checking if navigate exists
    if (line.match(/\bnavigate\(/) && !line.includes('typeof navigate') && !line.includes('navigate &&')) {
      if (!line.includes('function') && !line.includes('const navigate =')) {
        // console.log(`[UNCHECKED NAVIGATE] ${file}:${lNum} -> ${line.trim()}`);
      }
    }

    // 4. Undefined variable reference in inline style objects
    // Look for style={{ ... key: identifier }}
    const styleAttrMatches = line.match(/style\s*=\s*\{\s*\{[^}]*\}\s*\}/g);
    if (styleAttrMatches) {
      styleAttrMatches.forEach(s => {
        // match key: identifier where identifier is not string, number, boolean, variable with quotes or ternary
        const pairs = s.match(/([a-zA-Z0-9_$]+)\s*:\s*([a-zA-Z_$][a-zA-Z0-9_$]*)/g);
        if (pairs) {
          pairs.forEach(pair => {
            const [k, v] = pair.split(':').map(x => x.trim());
            const safe = ['true', 'false', 'null', 'undefined', 'auto', 'inherit', 'initial', 'none', 'unset', 'center', 'right', 'left', 'flex', 'block', 'none', 'row', 'column'];
            if (!safe.includes(v) && !v.includes('Style') && !v.includes('color') && !v.includes('bg') && !v.includes('size') && !v.includes('height') && !v.includes('width') && !v.includes('margin') && !v.includes('padding') && !v.includes('border') && !v.includes('active') && !v.includes('selected') && !v.includes('is') && !v.includes('has') && !v.includes('show') && !v.includes('open') && !v.includes('mode') && !v.includes('theme') && !v.includes('val') && !v.includes('var') && !v.includes('item') && !v.includes('prod') && !v.includes('order') && !v.includes('user') && !v.includes('tab') && !v.includes('cat') && !v.includes('idx') && !v.includes('index') && !v.includes('state') && !v.includes('State') && !v.includes('prev') && !v.includes('next') && !v.includes('current') && !v.includes('sub')) {
              if (['spaceBetween', 'spaceAround', 'spaceEvenly', 'flexStart', 'flexEnd'].includes(v)) {
                console.log(`[UNQUOTED STYLE VAR] ${file}:${lNum} (${pair}) -> ${line.trim()}`);
                foundCount++;
              }
            }
          });
        }
      });
    }
  });
});

console.log(`\nTotal potential crash risks found: ${foundCount}`);
