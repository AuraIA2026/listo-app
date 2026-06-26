import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB4z90F946H6BP6hyq8gAv--RLirXdBtYE",
  authDomain: "listoapp-52b46.firebaseapp.com",
  projectId: "listoapp-52b46",
  storageBucket: "listoapp-52b46.firebasestorage.app",
  messagingSenderId: "43690567000",
  appId: "1:43690567000:web:d7486d9eb1f4aaedf6b12d",
  measurementId: "G-PPD01JYC5P"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function checkConfig() {
  try {
    console.log("Iniciando sesión con cliente@test.com...");
    await signInWithEmailAndPassword(auth, "cliente@test.com", "123456");
    console.log("✅ Sesión iniciada con éxito.");
    
    console.log("Intentando leer settings/appConfig...");
    const docRef = doc(db, "settings", "appConfig");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      console.log("✅ Documento recuperado con éxito:", JSON.stringify(snap.data()));
    } else {
      console.log("⚠️ El documento settings/appConfig NO existe.");
    }
  } catch (err) {
    console.error("❌ Error recuperando el documento:", err);
  }
  process.exit(0);
}

checkConfig();
