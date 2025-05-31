// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { GoogleAuthProvider} from 'firebase/auth';

// Add this line to create the provider
const provider = new GoogleAuthProvider();
// ✅ Replace these with your new Firebase config

const firebaseConfig = {
  apiKey: "AIzaSyBAwDmj5YSTCKQRB6E9qz_9lElFwGYK8PM",
  authDomain: "canonforces-a743b.firebaseapp.com",
  projectId: "canonforces-a743b",
  storageBucket: "canonforces-a743b.firebasestorage.app",
  messagingSenderId: "530076439567",
  appId: "1:530076439567:web:d4c1d986fc02b76718bf7a",
  measurementId: "G-P11PC4XZR8"
};


const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
export { provider };
export { app, auth, db };
