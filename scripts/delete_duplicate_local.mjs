import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB4z90F946H6BP6hyq8gAv--RLirXdBtYE",
  authDomain: "listoapp-52b46.firebaseapp.com",
  projectId: "listoapp-52b46",
  storageBucket: "listoapp-52b46.firebasestorage.app",
  messagingSenderId: "43690567000",
  appId: "1:43690567000:web:d7486d9eb1f4aaedf6b12d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  // Listar TODOS los locales para ver sus campos reales
  const snap = await getDocs(collection(db, 'locales'));
  console.log(`\nTotal locales en Firestore: ${snap.size}\n`);

  const list = [];
  snap.forEach(d => {
    const data = d.data();
    list.push({ id: d.id, data });
    const nombre = data.nombre || data.name || data.storeName || data.commerceName || '?';
    const tel = data.telefono || data.phone || data.telefono_local || '?';
    const productos = data.productos?.length ?? data.platillos?.length ?? '?';
    console.log(`ID: ${d.id}`);
    console.log(`  Nombre   : ${nombre}`);
    console.log(`  Teléfono : ${tel}`);
    console.log(`  Productos: ${productos}`);
    console.log(`  proId    : ${data.proId || '?'}`);
    console.log('');
  });

  // Buscar duplicados por nombre
  const grupos = {};
  list.forEach(({ id, data }) => {
    const nombre = (data.nombre || data.name || data.storeName || '').trim().toUpperCase();
    if (!grupos[nombre]) grupos[nombre] = [];
    grupos[nombre].push({ id, data });
  });

  console.log('\n=== DUPLICADOS DETECTADOS ===');
  let found = false;
  for (const [nombre, items] of Object.entries(grupos)) {
    if (items.length > 1) {
      found = true;
      console.log(`\n⚠️  "${nombre}" aparece ${items.length} veces:`);
      items.forEach(({ id, data }) => {
        const tel = data.telefono || data.phone || '?';
        const prods = data.productos?.length ?? data.platillos?.length ?? 0;
        console.log(`   - ID: ${id} | Tel: ${tel} | Productos: ${prods} | proId: ${data.proId}`);
      });

      // Eliminar el que tenga MENOS productos (el vacío/duplicado)
      const sorted = items.sort((a, b) => {
        const pa = a.data.productos?.length ?? a.data.platillos?.length ?? 0;
        const pb = b.data.productos?.length ?? b.data.platillos?.length ?? 0;
        return pa - pb; // el de menos productos primero
      });

      const toDelete = sorted[0];
      const prods = toDelete.data.productos?.length ?? toDelete.data.platillos?.length ?? 0;
      console.log(`\n  🗑️  Eliminando el duplicado con MENOS productos:`);
      console.log(`     ID: ${toDelete.id} | Tel: ${toDelete.data.telefono || '?'} | Productos: ${prods}`);
      
      await deleteDoc(doc(db, 'locales', toDelete.id));
      console.log(`  ✅ Eliminado correctamente!`);
    }
  }

  if (!found) {
    console.log('No se encontraron duplicados por nombre.');
  }

  console.log('\n🎉 Proceso completado.');
  process.exit(0);
}

run().catch(err => { console.error('Error:', err); process.exit(1); });
