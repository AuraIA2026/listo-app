const admin = require('firebase-admin');
const serviceAccount = require('./functions/serviceAccountKey.json');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function main() {
  console.log('\n======================================');
  console.log('  DIAGNÓSTICO LISTO - VERIFICACIONES');
  console.log('======================================\n');

  // 1. Usuarios con verificacion.estado == 'en_revision'
  console.log('📋 1. POSTULACIONES PENDIENTES (verificacion.estado == en_revision):');
  const verifSnap = await db.collection('users')
    .where('verificacion.estado', '==', 'en_revision')
    .get();

  if (verifSnap.empty) {
    console.log('   ✅ No hay postulaciones pendientes en este momento.\n');
  } else {
    console.log(`   ⚠️  HAY ${verifSnap.docs.length} POSTULACION(ES) PENDIENTE(S):\n`);
    verifSnap.docs.forEach((doc, i) => {
      const d = doc.data();
      console.log(`   [${i+1}] UID: ${doc.id}`);
      console.log(`        Nombre: ${d.verificacion?.nombre || d.name || 'Sin nombre'}`);
      console.log(`        Email:  ${d.verificacion?.correo || d.email || 'Sin email'}`);
      console.log(`        Enviado: ${d.verificacion?.enviadoEn || 'Fecha desconocida'}`);
      console.log('');
    });
  }

  // 2. Alertas de admin en notificaciones
  console.log('🔔 2. ALERTAS DE ADMIN EN FIRESTORE (userId == admin):');
  const alertSnap = await db.collection('notificaciones')
    .where('userId', '==', 'admin')
    .orderBy('createdAt', 'desc')
    .limit(20)
    .get();

  if (alertSnap.empty) {
    console.log('   ❌ No hay ninguna notificación de admin guardada.\n');
  } else {
    console.log(`   📬 Hay ${alertSnap.docs.length} notificacion(es) de admin:\n`);
    alertSnap.docs.forEach((doc, i) => {
      const d = doc.data();
      const fecha = d.createdAt?.toDate?.()?.toLocaleString('es-DO') || d.date || 'Sin fecha';
      console.log(`   [${i+1}] Tipo: ${d.type}`);
      console.log(`        Título: ${d.title}`);
      console.log(`        Leído: ${d.read ? 'Sí' : 'NO ← PENDIENTE'}`);
      console.log(`        Fecha: ${fecha}`);
      console.log('');
    });
  }

  // 3. Verificar si existe documento users/admin
  console.log('👤 3. DOCUMENTO users/admin EN FIRESTORE:');
  const adminDoc = await db.collection('users').doc('admin').get();
  if (adminDoc.exists) {
    const d = adminDoc.data();
    console.log(`   ✅ Existe. FCM Token: ${d.fcmToken ? '✅ Guardado' : '❌ NO tiene FCM token (push no funciona)'}\n`);
  } else {
    console.log('   ❌ NO EXISTE documento users/admin → las push notifications al admin NUNCA llegan.\n');
    console.log('   → Se creará ahora...');
    // Crear documento admin si no existe
    await db.collection('users').doc('admin').set({
      role: 'admin',
      email: 'listopatron.app@gmail.com',
      name: 'Admin ListoPatrón',
      fcmToken: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    console.log('   ✅ Documento users/admin creado.\n');
  }

  // 4. Notificaciones de tipo new_verification_request de los últimos 7 días
  console.log('🛡️  4. NOTIFICACIONES new_verification_request (últimas 20):');
  const newVerifSnap = await db.collection('notificaciones')
    .where('userId', '==', 'admin')
    .where('type', '==', 'new_verification_request')
    .get();

  if (newVerifSnap.empty) {
    console.log('   ❌ No hay ninguna notificación de tipo new_verification_request guardada.');
    console.log('   → Esto significa que nadie ha enviado verificación O hubo error al guardarla.\n');
  } else {
    console.log(`   📬 Hay ${newVerifSnap.docs.length} notificacion(es) de postulación:\n`);
    newVerifSnap.docs.forEach((doc, i) => {
      const d = doc.data();
      const fecha = d.createdAt?.toDate?.()?.toLocaleString('es-DO') || d.date || 'Sin fecha';
      console.log(`   [${i+1}] ${d.title} | Leído: ${d.read ? 'Sí' : 'NO'} | Fecha: ${fecha}`);
      console.log(`        ${d.text}`);
      console.log('');
    });
  }

  console.log('======================================');
  console.log('  DIAGNÓSTICO COMPLETO');
  console.log('======================================\n');

  process.exit(0);
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
