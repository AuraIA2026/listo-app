const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function backupCollection(collectionRef, dataObj) {
  const snapshot = await collectionRef.get();
  const docs = snapshot.docs;
  for (const doc of docs) {
    dataObj[doc.id] = {
      _data: doc.data(),
      _subcollections: {}
    };
    
    // Obtener subcolecciones asociadas a este documento
    const subcollections = await doc.ref.listCollections();
    for (const subcol of subcollections) {
      dataObj[doc.id]._subcollections[subcol.id] = {};
      await backupCollection(subcol, dataObj[doc.id]._subcollections[subcol.id]);
    }
  }
}

async function runBackup() {
  console.log("Iniciando copia de seguridad completa de Firestore...");
  const collections = await db.listCollections();
  const backupData = {};

  for (const collection of collections) {
    const colId = collection.id;
    console.log(`Descargando colección: ${colId}...`);
    backupData[colId] = {};
    await backupCollection(collection, backupData[colId]);
  }

  const outputPath = path.join(__dirname, 'firestore_backup.json');
  fs.writeFileSync(outputPath, JSON.stringify(backupData, null, 2));
  console.log(`\n¡Éxito! Copia de seguridad guardada en:\n${outputPath}`);
}

runBackup().catch(err => {
  console.error("Error crítico durante la copia de seguridad:", err);
});
