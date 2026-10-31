const https = require('https');

const PROJECT_ID = 'listoapp-52b46';
const API_KEY = 'AIzaSyB4z90F946H6BP6hyq8gAv--RLirXdBtYE';

function firestoreQuery(collectionId, fieldFilter) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      structuredQuery: {
        from: [{ collectionId }],
        where: fieldFilter ? {
          fieldFilter: {
            field: { fieldPath: fieldFilter.field },
            op: 'EQUAL',
            value: { stringValue: fieldFilter.value }
          }
        } : undefined,
        limit: 50
      }
    });

    const options = {
      hostname: 'firestore.googleapis.com',
      path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery?key=${API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    let data = '';
    const req = https.request(options, (res) => {
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function getField(doc, path) {
  const parts = path.split('.');
  let current = doc?.fields;
  for (const part of parts) {
    if (!current) return null;
    current = current[part]?.mapValue?.fields || current[part];
  }
  if (current?.stringValue !== undefined) return current.stringValue;
  if (current?.booleanValue !== undefined) return current.booleanValue;
  if (current?.timestampValue !== undefined) return current.timestampValue;
  return null;
}

async function main() {
  console.log('\n======================================');
  console.log('  DIAGNÓSTICO LISTO - VERIFICACIONES');
  console.log('======================================\n');

  // 1. Buscar usuarios con verificacion.estado = en_revision
  console.log('📋 1. POSTULACIONES PENDIENTES (en_revision):');
  const usersResult = await firestoreQuery('users', { field: 'verificacion.estado', value: 'en_revision' });
  const pendingUsers = usersResult.filter(r => r.document);

  if (pendingUsers.length === 0) {
    console.log('   ✅ No hay postulaciones en estado en_revision.\n');
  } else {
    console.log(`   ⚠️  HAY ${pendingUsers.length} POSTULACION(ES) PENDIENTE(S):\n`);
    pendingUsers.forEach((r, i) => {
      const doc = r.document;
      const docId = doc.name.split('/').pop();
      const nombre = getField(doc, 'verificacion.nombre') || getField(doc, 'name') || 'Sin nombre';
      const correo = getField(doc, 'verificacion.correo') || getField(doc, 'email') || 'Sin email';
      const enviado = getField(doc, 'verificacion.enviadoEn') || 'Fecha desconocida';
      console.log(`   [${i+1}] UID:    ${docId}`);
      console.log(`        Nombre: ${nombre}`);
      console.log(`        Email:  ${correo}`);
      console.log(`        Fecha:  ${enviado}`);
      console.log('');
    });
  }

  // 2. Alertas admin en notificaciones
  console.log('🔔 2. NOTIFICACIONES DE ADMIN (userId == admin):');
  const notifsResult = await firestoreQuery('notificaciones', { field: 'userId', value: 'admin' });
  const adminNotifs = notifsResult.filter(r => r.document && getField(r.document, 'type') === 'new_verification_request');

  if (adminNotifs.length === 0) {
    console.log('   ❌ No hay notificaciones guardadas para userId==admin.\n');
  } else {
    const verifNotifs = adminNotifs.filter(r => {
      const t = getField(r.document, 'type');
      return t === 'new_verification_request';
    });
    console.log(`   📬 Total notifs admin: ${adminNotifs.length}`);
    console.log(`   🛡️  De tipo verificación: ${verifNotifs.length}\n`);
    adminNotifs.forEach((r, i) => {
      const doc = r.document;
      const tipo = getField(doc, 'type') || '?';
      const titulo = getField(doc, 'title') || '?';
      const leido = getField(doc, 'read');
      const fecha = getField(doc, 'date') || getField(doc, 'createdAt') || '?';
      console.log(`   [${i+1}] Tipo: ${tipo}`);
      console.log(`        Título: ${titulo}`);
      console.log(`        Leído: ${leido ? 'Sí' : '❌ NO LEÍDO'}`);
      console.log(`        Fecha: ${typeof fecha === 'string' ? fecha.substring(0,19) : fecha}`);
      console.log('');
    });
  }

  console.log('======================================\n');
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});


