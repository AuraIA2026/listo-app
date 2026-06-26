import { execSync } from 'child_process';
import os from 'os';
import fs from 'fs';
import path from 'path';

try {
  const rootDir = 'E:\\Listo';
  const opts = { cwd: rootDir, stdio: 'inherit' };
  
  console.log('--- 🚀 INICIANDO DESPLIEGUE A GITHUB/VERCEL Y COMPILACIÓN DE APK/AAB ---');

  // 1. Enviar cambios a GitHub (Vercel)
  console.log('\n[1/5] Subiendo los últimos cambios de UI a GitHub (Despliegue en Vercel)...');
  try {
    execSync('git add .', opts);
    execSync('git commit -m "UI Updates y mejoras (Search Page y Home Page) - Compilando versión final"', opts);
    execSync('git push', opts);
    console.log('✅ Cambios subidos a GitHub con éxito. Vercel está compilando el sitio web.');
  } catch (err) {
    console.log('⚠️ No se pudieron subir cambios (tal vez no había cambios pendientes en Git o la red falló):', err.message);
  }

  // 2. Construir paquete web
  console.log('\n[2/5] Construyendo paquete web de React...');
  execSync('npm run build', opts);
  
  // 3. Sincronizar con Capacitor
  console.log('\n[3/5] Sincronizando plataforma Android con Capacitor...');
  execSync('npx cap sync android', opts);
  
  // 4. Optimizar imágenes
  console.log('\n[4/5] Optimizando imágenes en el bundle Android...');
  try {
    execSync('node compress_imgs_android.cjs', opts);
  } catch (err) {
    console.log('⚠️ Error al optimizar imágenes, continuando build:', err.message);
  }
  
  // 5. Compilar formatos Android (.AAB y .APK)
  console.log('\n[5/5] Generando formatos APK y AAB de producción...');
  const gradleEnv = { ...process.env };
  // Intentamos usar el JDK de Android Studio si está configurado, si no, usamos el del sistema por defecto
  if (fs.existsSync('C:\\Program Files\\Android\\Android Studio\\jbr')) {
    gradleEnv.JAVA_HOME = 'C:\\Program Files\\Android\\Android Studio\\jbr';
  }
  
  const cleanCmd = os.platform() === 'win32' ? '.\\gradlew.bat clean' : './gradlew clean';
  const bundleCmd = os.platform() === 'win32' ? '.\\gradlew.bat bundleRelease' : './gradlew bundleRelease';
  const assembleCmd = os.platform() === 'win32' ? '.\\gradlew.bat assembleRelease' : './gradlew assembleRelease';

  console.log('\n-> Ejecutando Gradle Clean...');
  execSync(cleanCmd, { cwd: `${rootDir}\\android`, stdio: 'inherit', env: gradleEnv });

  console.log('\n-> Generando AAB (bundleRelease) para Google Play Store...');
  execSync(bundleCmd, { cwd: `${rootDir}\\android`, stdio: 'inherit', env: gradleEnv });

  console.log('\n-> Generando APK (assembleRelease) para instalación directa...');
  execSync(assembleCmd, { cwd: `${rootDir}\\android`, stdio: 'inherit', env: gradleEnv });
  
  console.log('\n✨ ¡COMPILACIÓN COMPLETADA CON ÉXITO! ✨');

  // Copiar archivos generados a los destinos
  const desktopDestDir = 'C:\\Users\\13900K\\Desktop\\listo patron';
  const samsungDestDir = 'E:\\release';

  const srcAab = `${rootDir}\\android\\app\\build\\outputs\\bundle\\release\\app-release.aab`;
  const srcApk = `${rootDir}\\android\\app\\build\\outputs\\apk\\release\\app-release.apk`;

  const destFiles = [
    { src: srcAab, destDir: desktopDestDir, name: 'app-release.aab' },
    { src: srcApk, destDir: desktopDestDir, name: 'app-release.apk' },
    { src: srcAab, destDir: samsungDestDir, name: 'app-release.aab' },
    { src: srcApk, destDir: samsungDestDir, name: 'app-release.apk' }
  ];

  console.log('\n--- 📂 COPIANDO ARCHIVOS GENERADOS ---');
  destFiles.forEach(({ src, destDir, name }) => {
    if (fs.existsSync(src)) {
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      const destPath = path.join(destDir, name);
      fs.copyFileSync(src, destPath);
      console.log(`🚀 Copiado con éxito: ${destPath}`);
    } else {
      console.error(`⚠️ No se encontró el archivo compilado en ${src}`);
    }
  });

  console.log('\n👉 ¡Todo listo! Ya puedes revisar tu escritorio en la carpeta "listo patron".\n');

} catch(e) {
  console.error('\n❌ ERROR DURANTE LA COMPILACIÓN O DESPLIEGUE:');
  console.error(e.message);
  console.log('\nSi obtienes un error relacionado con Gradle, abre Android Studio y ejecuta: File > Sync Project with Gradle Files.');
}
