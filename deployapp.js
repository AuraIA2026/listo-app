import { execSync } from 'child_process';

try {
  const opts = { cwd: '.', stdio: 'inherit' };
  console.log('Pushing to GitHub...');
  execSync('git add .', opts);
  execSync('git commit -m "Listo Patrón: Pasarela AZUL y unificación de marca Listo Patrón"', opts);
  execSync('git push', opts);
  console.log('Success! Vercel should be building now.');
} catch(e) {
  console.error('Error deploying:', e.message);
}
