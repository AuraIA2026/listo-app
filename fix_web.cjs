const fs = require('fs');
const path = require('path');

const srcAssets = path.join(__dirname, 'src', 'assets');
const publicAssets = path.join(__dirname, 'public', 'assets');

// Copy all files
const files = fs.readdirSync(srcAssets);
for (const file of files) {
  const stat = fs.statSync(path.join(srcAssets, file));
  if (stat.isFile() && (file.endsWith('.png') || file.endsWith('.jpeg') || file.endsWith('.jpg'))) {
    fs.copyFileSync(path.join(srcAssets, file), path.join(publicAssets, file));
    console.log('Copied', file);
  }
}

// Replace in HomePage.jsx
const homePageFile = path.join(__dirname, 'src', 'pages', 'HomePage.jsx');
let content = fs.readFileSync(homePageFile, 'utf8');
content = content.replace(/\.\.\/src\/assets\//g, './assets/');
fs.writeFileSync(homePageFile, content);
console.log('HomePage.jsx path fixed');
