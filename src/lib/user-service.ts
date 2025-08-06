
'use server';

import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Checks if a user's email is present in the 'users' collection in Firestore.
 * @param email The user's email address.
 * @returns A boolean indicating if the user is authorized.
 */
export async function isUserAuthorized(email: string | null | undefined): Promise<boolean> {
  // An empty email is never authorized.
  if (!email) {
    return false;
  }
  
  try {
    // Reference to the 'users' collection in Firestore.
    const usersRef = collection(db, "users");
    
    // Create a query to find a document where the 'email' field matches the user's email.
    const q = query(usersRef, where("email", "==", email));
    
    // Execute the query.
    const querySnapshot = await getDocs(q);
    
    // If the query returns any documents, the user is authorized.
    // The result is not empty, meaning at least one document was found.
    return !querySnapshot.empty;

  } catch (error) {
    // Log the detailed error to the server console for debugging.
    console.error("Error checking user authorization in Firestore:", error);
    
    // In case of a Firestore error (e.g., permission denied), deny access to be safe.
    return false;
  }
}
