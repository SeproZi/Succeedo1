// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDNTbT-SuOATom7t5e8cOygZjMSiaf9aGo",
  authDomain: "test-prcas-cm.firebaseapp.com",
  projectId: "test-prcas-cm",
  storageBucket: "test-prcas-cm.firebasestorage.app",
  messagingSenderId: "926638638358",
  appId: "1:926638638358:web:b48e457a61780649f7bc37",
  measurementId: "G-LT26RP9GXH"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
// It's good practice to initialize analytics only on the client-side.
if (typeof window !== 'undefined') {
  getAnalytics(app);
}

export { app, auth, db };
