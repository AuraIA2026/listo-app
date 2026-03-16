import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Same config as src/firebase.js
const firebaseConfig = {
  apiKey: "AIzaSyDa-...", // Will be filled from env somehow or use emulator 
};

// We will use the REST API of Firebase Auth to create a user and Firestore via Admin SDK or just print the credentials
console.log("Creación manual: Por favor, ve a http://localhost:5173/register y crea una cuenta con Rol Cliente.");
