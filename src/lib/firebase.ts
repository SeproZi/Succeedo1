
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { firebaseApp } from "./firebase.client";

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

// It's good practice to initialize analytics only on the client-side.
if (typeof window !== 'undefined') {
  getAnalytics(firebaseApp);
}

export { firebaseApp as app, auth, db };
