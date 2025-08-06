// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration from your project settings
const firebaseConfig = {
  apiKey: "AIzaSyDNTbT-SuOATom7t5e8c0ygZjMSiaf9aGo",
  authDomain: "test-prcas-cm.firebaseapp.com",
  projectId: "test-prcas-cm",
  storageBucket: "test-prcas-cm.appspot.com",
  messagingSenderId: "926638638358",
  appId: "1:926638638358:web:b48e457a61780649f7bc37",
  measurementId: "G-LT26RP9GXH"
};


// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
