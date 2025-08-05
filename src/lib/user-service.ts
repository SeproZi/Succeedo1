'use server';

import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';

// This is a mock service. In a real application, you would look up the user 
// in a database or an authentication service.
const authorizedUsers = [
    'test@example.com',
    'user@google.com',
    'sedat.c@boeing.com',
    'atilla.seprodi@visma.com'
];

export async function isUserAuthorized(email: string | null | undefined): Promise<boolean> {
  if (!email) {
    return false;
  }
  
  try {
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking authorization:", error);
    return false;
  }
}
