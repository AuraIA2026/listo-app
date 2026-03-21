import { execSync } from 'child_process';

try {
  const opts = { cwd: 'C:\\Users\\13900K\\Documents\\GitHub\\listopatron', stdio: 'inherit' };
  console.log('Undoing last commit...');
  execSync('git reset HEAD~1', opts);
  console.log('Success!');
} catch(e) {
  console.error('Error undoing:', e.message);
}
