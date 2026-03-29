import { execSync } from 'child_process';

try {
  const opts = { cwd: 'E:\\Listo', stdio: 'inherit' };
  console.log('Pushing to GitHub...');
  execSync('git add .', opts);
  execSync('git commit -m "UI Updates y mejoras (Search Page y Home Page)"', opts);
  execSync('git push', opts);
  console.log('Success! Vercel should be building now.');
} catch(e) {
  console.error('Error deploying:', e.message);
}
