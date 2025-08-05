// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// IMPORTANT: Replace this with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyCV_MptESLcyN51o0Pj6PCgXzVqGqOykXg",
  authDomain: "test-prcas-cm.firebaseapp.com",
  projectId: "test-prcas-cm",
  storageBucket: "test-prcas-cm.appspot.com",
  messagingSenderId: "931253569530",
  appId: "1:931253569530:web:9c7553f473c0993952f1e6"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
