import { execSync } from 'child_process';
import os from 'os';

try {
  const rootDir = 'E:\\Listo';
  const opts = { cwd: rootDir, stdio: 'inherit' };
  
  console.log('--- 🚀 INICIANDO COMPILACIÓN PARA GOOGLE PLAY ---');

  console.log('\n[1/3] Construyendo paquete web de React...');
  execSync('npm run build', opts);
  
  console.log('\n[2/3] Sincronizando plataforma Android...');
  execSync('npx cap sync android', opts);
  
  console.log('\n[3/3] Generando formato .AAB (Android App Bundle)...');
  const gradleCmd = os.platform() === 'win32' ? '.\\gradlew.bat clean bundleRelease' : './gradlew clean bundleRelease';
  execSync(gradleCmd, { cwd: `${rootDir}\\android`, stdio: 'inherit' });
  
  console.log('\n✨ ¡COMPILACIÓN ÉXITOSA! ✨');
  console.log('Tu archivo de producción para subir a la consola de Google Play está en:');
  console.log('👉 E:\\Listo\\android\\app\\build\\outputs\\bundle\\release\\app-release.aab\n');

} catch(e) {
  console.error('\n❌ ERROR DURANTE LA COMPILACIÓN:');
  console.error(e.message);
  console.log('\nSi obtienes un error de "Could not resolve all artifacts", ve a Android Studio y deja que sincronice los archivos (File > Sync Project with Gradle Files).');
}
