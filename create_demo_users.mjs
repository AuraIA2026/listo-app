import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

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

async function createUsers() {
  console.log("Iniciando creación de usuarios demo...");
  
  try {
    const cred1 = await createUserWithEmailAndPassword(auth, "cliente@test.com", "123456");
    await setDoc(doc(db, "users", cred1.user.uid), {
      email: "cliente@test.com",
      name: "Google Cliente Demo",
      role: "user",
      type: "client",
      createdAt: new Date().toISOString()
    });
    console.log("✅ Cuenta CLIENTE creada exitosamente (cliente@test.com)");
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') {
      console.log("⚠️ Cuenta CLIENTE ya existía.");
    } else {
      console.error("Error creando cliente:", err);
    }
  }

  try {
    const cred2 = await createUserWithEmailAndPassword(auth, "pro@test.com", "123456");
    await setDoc(doc(db, "users", cred2.user.uid), {
      email: "pro@test.com",
      name: "Google Pro Demo",
      role: "professional",
      type: "pro",
      approved: true, // Importante para que Google pueda pasar directo
      profileComplete: true,
      contracts: 50,
      rating: 5.0,
      cedula: "000-GOOGLE-TEST",
      phone: "809-555-5555",
      photoURL: "https://ui-avatars.com/api/?name=Google+Pro&background=random",
      planStatus: "active",
      createdAt: new Date().toISOString()
    });
    console.log("✅ Cuenta PROFESIONAL creada exitosamente (pro@test.com)");
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') {
      console.log("⚠️ Cuenta PROFESIONAL ya existía.");
    } else {
      console.error("Error creando profesional:", err);
    }
  }

  process.exit(0);
}

createUsers();
