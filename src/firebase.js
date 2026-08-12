import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Capacitor } from "@capacitor/core";

const firebaseConfig = {
  apiKey: "AIzaSyB4z90F946H6BP6hyq8gAv--RLirXdBtYE",
  authDomain: "listoapp-52b46.firebaseapp.com",
  projectId: "listoapp-52b46",
  storageBucket: "listoapp-52b46.firebasestorage.app",
  messagingSenderId: "43690567000",
  appId: "1:43690567000:web:d7486d9eb1f4aaedf6b12d",
  measurementId: "G-PPD01JYC5P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Authentication with local persistence for Capacitor native platforms and Web
export const auth = Capacitor.isNativePlatform()
  ? initializeAuth(app, { persistence: browserLocalPersistence })
  : getAuth(app);

// Initialize Firestore Database
export const db = getFirestore(app);

// Initialize Cloud Storage
export const storage = getStorage(app);

// Initialize Cloud Functions
import { getFunctions } from "firebase/functions";
export const functions = getFunctions(app);

export default app;