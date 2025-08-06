
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

/**
 * Checks if a user with the given email is present in the 'users' collection.
 * @param email The email to check.
 * @returns {Promise<boolean>} True if the user is authorized, false otherwise.
 */
export async function isUserAuthorized(email: string): Promise<boolean> {
  if (!email) {
    return false;
  }
  
  try {
    const usersCollection = collection(db, 'users');
    // Note: Firestore queries are case-sensitive. Ensure email in DB matches.
    const q = query(usersCollection, where('email', '==', email.toLowerCase()));
    const querySnapshot = await getDocs(q);
    
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking user authorization:", error);
    // In case of a security rule error or other issue, default to unauthorized.
    return false;
  }
}
