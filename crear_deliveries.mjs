// crear_deliveries.mjs
// Script para crear 2 perfiles de delivery reales en Firestore (colección drivers_online)
// Ejecutar: node crear_deliveries.mjs

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB4z90F946H6BP6hyq8gAv--RLirXdBtYE",
  authDomain: "listoapp-52b46.firebaseapp.com",
  projectId: "listoapp-52b46",
  storageBucket: "listoapp-52b46.firebasestorage.app",
  messagingSenderId: "43690567000",
  appId: "1:43690567000:web:d7486d9eb1f4aaedf6b12d",
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// ─────────────────────────────────────────────────────────────
// 📍 Coordenadas: Santiago, RD (cerca del centro)
// Delivery 1: ~300 m al norte del local
// Delivery 2: ~350 m al este del local
// Ajusta lat/lng a la posición real de cada motorista.
// ─────────────────────────────────────────────────────────────

const deliveries = [
  {
    id: 'delivery_real_001',          // ID fijo — fácil de editar después
    name: 'Delivery 1',              // ← Cambia al nombre real
    phone: '18091234567',            // ← Cambia al número real (sin guiones)
    vehicle: 'Moto Honda CG',        // ← Cambia al vehículo real
    plate: 'H-123456',              // ← Cambia a la placa real
    rating: '5.0',
    trips: 0,
    lat: 19.4534,                    // ← Coordenada real del motorista
    lng: -70.6952,
    online: true,                    // ✅ En línea — aparece en el mapa
    photo: '',                       // URL de foto (opcional)
    updatedAt: null,
  },
  {
    id: 'delivery_real_002',
    name: 'Delivery 2',              // ← Cambia al nombre real
    phone: '18097654321',            // ← Cambia al número real
    vehicle: 'Moto Yamaha',          // ← Cambia al vehículo real
    plate: 'H-654321',              // ← Cambia a la placa real
    rating: '5.0',
    trips: 0,
    lat: 19.4521,
    lng: -70.6935,
    online: true,
    photo: '',
    updatedAt: null,
  },
];

async function main() {
  console.log('🚀 Creando perfiles de delivery en Firestore...\n');

  for (const d of deliveries) {
    const { id, ...data } = d;
    await setDoc(doc(db, 'drivers_online', id), {
      ...data,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    });
    console.log(`✅ Creado: ${id} — ${data.name} (${data.vehicle}) | online: ${data.online}`);
  }

  console.log('\n✅ ¡Listo! Los 2 deliveries ya aparecen en el mapa de "Delivery Cerca".');
  console.log('📝 Para editar nombre/teléfono/placa: modifica este archivo y vuelve a ejecutarlo.');
  console.log('🔴 Para ponerlos offline: cambia online: false y re-ejecuta.\n');
  process.exit(0);
}

main().catch(e => { console.error('❌ Error:', e); process.exit(1); });
