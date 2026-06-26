import { execSync } from 'child_process';
import os from 'os';
import fs from 'fs';
import path from 'path';

try {
  const rootDir = 'E:\\Listo';
  const opts = { cwd: rootDir, stdio: 'inherit' };
  
  console.log('--- 🚀 INICIANDO COMPILACIÓN PARA GOOGLE PLAY ---');

  console.log('\n[1/3] Construyendo paquete web de React...');
  execSync('npm run build', opts);
  
  console.log('\n[2/3] Sincronizando plataforma Android...');
  execSync('npx cap sync android', opts);
  
  console.log('\n[2.5/3] Optimizando imágenes para reducir el peso del AAB...');
  execSync('node compress_imgs_android.cjs', opts);
  
  console.log('\n[3/3] Generando formato .AAB (Android App Bundle)...');
  const gradleCmd = os.platform() === 'win32' ? '.\\gradlew.bat clean bundleRelease' : './gradlew clean bundleRelease';
  const gradleEnv = { ...process.env, JAVA_HOME: 'C:\\Program Files\\Android\\Android Studio\\jbr' };
  execSync(gradleCmd, { cwd: `${rootDir}\\android`, stdio: 'inherit', env: gradleEnv });
  
  console.log('\n✨ ¡COMPILACIÓN ÉXITOSA! ✨');
  console.log('Tu archivo de producción para subir a la consola de Google Play está en:');
  console.log('👉 E:\\Listo\\android\\app\\build\\outputs\\bundle\\release\\app-release.aab\n');

  const destDir = 'C:\\Users\\13900K\\Desktop\\listo patron';
  const srcFile = `${rootDir}\\android\\app\\build\\outputs\\bundle\\release\\app-release.aab`;
  const destFile = path.join(destDir, 'app-release.aab');
  const samsungDestDir = 'E:\\release';
  const samsungDestFile = path.join(samsungDestDir, 'app-release.aab');

  console.log('--- 📂 COPIANDO AAB AL ESCRITORIO Y AL DISCO SAMSUNG ---');
  if (fs.existsSync(srcFile)) {
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(srcFile, destFile);
    console.log(`🚀 ¡Copiado con éxito a tu carpeta del Escritorio!`);
    console.log(`👉 ${destFile}\n`);

    if (!fs.existsSync(samsungDestDir)) {
      fs.mkdirSync(samsungDestDir, { recursive: true });
    }
    fs.copyFileSync(srcFile, samsungDestFile);
    console.log(`🚀 ¡Copiado con éxito al disco duro SAMSUNG!`);
    console.log(`👉 ${samsungDestFile}\n`);
  } else {
    console.error(`⚠️ No se encontró el archivo compilado en ${srcFile} para copiarlo.`);
  }

} catch(e) {
  console.error('\n❌ ERROR DURANTE LA COMPILACIÓN:');
  console.error(e.message);
  console.log('\nSi obtienes un error de "Could not resolve all artifacts", ve a Android Studio y deja que sincronice los archivos (File > Sync Project with Gradle Files).');
}
