import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCAaOs5CPjuRHjpS1c3HrvSWRQXIKKlhVU",
  authDomain: "tiktokclone-0001.firebaseapp.com",
  projectId: "tiktokclone-0001",
  storageBucket: "tiktokclone-0001.firebasestorage.app",
  messagingSenderId: "223843041370",
  appId: "1:223843041370:web:a8c4ed4872e94c6fc15863",
  measurementId: "G-C08BBCC8JK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
