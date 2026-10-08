const fs = require('fs');

const content = fs.readFileSync('E:/Listo/src/pages/MandamePage.jsx', 'utf8');
const lines = content.split('\n');

// Check for any potential bugs in MandamePage.jsx
lines.forEach((line, i) => {
  const lineNum = i + 1;

  // 1. Look for inline styles with missing quotes around property values or invalid variables
  if (line.includes('style={{')) {
    const styleMatches = line.match(/style\s*=\s*\{\s*\{([^}]+)\}\s*\}/g);
    if (styleMatches) {
      styleMatches.forEach(st => {
        // check each property
        const props = st.split(',');
        props.forEach(p => {
          const parts = p.split(':');
          if (parts.length === 2) {
            const val = parts[1].trim();
            // Check if val is an unquoted string like spaceBetween or flexStart
            if (['spaceBetween', 'spaceAround', 'spaceEvenly', 'flexStart', 'flexEnd', 'center', 'column', 'row'].includes(val)) {
              console.log(`[STYLE BUG L${lineNum}]: ${p.trim()} in line -> ${line.trim()}`);
            }
          }
        });
      });
    }
  }

  // 2. Look for property access on undefined (e.g. obj.prop.map without obj || obj.prop)
  if (line.includes('.map(') || line.includes('.filter(') || line.includes('.forEach(') || line.includes('.reduce(')) {
    if (!line.includes('?') && !line.includes('||') && !line.includes('Array.isArray')) {
      if (line.match(/(products|items|orders|stores|dishes|categories|banners|reviews|options|galleryImages|images|tags)\.(map|filter|forEach|reduce)\(/)) {
        console.log(`[UNCHECKED ARRAY METHOD L${lineNum}]: ${line.trim()}`);
      }
    }
  }

  // 3. Look for method calls on potentially undefined values (.toFixed, .toLowerCase, .toUpperCase, .split, .slice)
  if (line.match(/\.(toFixed|toLowerCase|toUpperCase|split|slice)\(/)) {
    if (!line.includes('?') && !line.includes('typeof') && !line.includes('||') && !line.includes("'") && !line.includes('"')) {
      console.log(`[UNCHECKED STRING/NUMBER METHOD L${lineNum}]: ${line.trim()}`);
    }
  }
});
