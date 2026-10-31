import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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

// Colecciones posibles donde pueden vivir los comercios
const COLECCIONES = ['locales', 'stores', 'comercios', 'restaurantes', 'negocios', 'productos'];

async function run() {
  for (const col of COLECCIONES) {
    try {
      const snap = await getDocs(collection(db, col));
      if (snap.size > 0) {
        console.log(`\n📦 Colección "${col}" — ${snap.size} documento(s):`);
        snap.forEach(d => {
          const data = d.data();
          const nombre = data.nombre || data.name || data.storeName || data.commerceName || '?';
          const tel = data.telefono || data.phone || '?';
          console.log(`  ID: ${d.id} | Nombre: "${nombre}" | Tel: ${tel}`);
        });
      }
    } catch(e) { /* colección no existe */ }
  }
  console.log('\n✅ Listo.');
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
