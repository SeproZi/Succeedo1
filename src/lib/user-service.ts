'use server';

import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';

export async function isUserAuthorized(email: string | null | undefined): Promise<boolean> {
  if (!email) {
    return false;
  }

  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking user authorization:", error);
    // In case of error, default to denying access for security.
    return false;
  }
}
