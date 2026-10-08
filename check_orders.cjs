const fs = require('fs');

const files = ['E:/Listo/src/pages/OrdersPage.jsx', 'E:/Listo/src/pages/MandamePage.jsx', 'E:/Listo/src/components/BottomNav.jsx'];

files.forEach(file => {
  console.log('--- CHECKING FILE:', file, '---');
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    const lNum = idx + 1;

    // Unprotected map/filter/forEach/reduce
    if (line.match(/(orders|items|history|dishes|products|requests)\.(map|filter|forEach|reduce|find|some|every)\(/)) {
      if (!line.includes('?') && !line.includes('||') && !line.includes('Array.isArray')) {
        console.log(`[UNCHECKED ARRAY METHOD] ${file}:${lNum} -> ${line.trim()}`);
      }
    }

    // Unprotected .split, .toLowerCase, .toUpperCase, .toFixed
    if (line.match(/\.(split|toLowerCase|toUpperCase|toFixed|slice)\(/)) {
      if (!line.includes('?') && !line.includes('typeof') && !line.includes('||') && !line.includes("'") && !line.includes('"') && !line.includes('String(')) {
        console.log(`[UNCHECKED STRING/NUMBER METHOD] ${file}:${lNum} -> ${line.trim()}`);
      }
    }

    // Property access on potentially null object like o.professional.name or order.driver.name or order.store.name
    if (line.match(/(order|o|item|prof|pro|user|merchant)\.[a-zA-Z0-9_$]+\.[a-zA-Z0-9_$]+/)) {
      if (!line.includes('?') && !line.includes('&&') && !line.includes('typeof') && !line.includes('||') && !line.includes('if')) {
        // Filter out false positives
        if (!line.includes('style.') && !line.includes('Math.') && !line.includes('Object.') && !line.includes('Date.') && !line.includes('console.') && !line.includes('localStorage.') && !line.includes('e.target.') && !line.includes('window.') && !line.includes('document.') && !line.includes('JSON.')) {
          console.log(`[POTENTIAL DEEP PROPERTY ACCESS] ${file}:${lNum} -> ${line.trim()}`);
        }
      }
    }
  });
});
