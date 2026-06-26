import { execSync } from 'child_process';

try {
  const opts = { cwd: '.', stdio: 'inherit' };
  console.log('Pushing to GitHub...');
  execSync('git add privacidad.html', opts);
  execSync('git commit -m "Agregando página de Política de Privacidad de Listo Patrón"', opts);
  execSync('git push', opts);
  console.log('Success!');
} catch(e) {
  console.error('Error deploying:', e.message);
}
