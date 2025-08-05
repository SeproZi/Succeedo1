// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// IMPORTANT: Replace this with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyA8EDVnJpB_C_D3m4y_T2Yx_Bw9p-ZkYxY",
  authDomain: "succeedo-by-proceedo-a9a35.firebaseapp.com",
  projectId: "succeedo-by-proceedo-a9a35",
  storageBucket: "succeedo-by-proceedo-a9a35.appspot.com",
  messagingSenderId: "53894101443",
  appId: "1:53894101443:web:96e2888f8d9b15b130e527"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
