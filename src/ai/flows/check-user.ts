'use server';
/**
 * @fileOverview A flow to check if a user exists in the Firestore database.
 * 
 * - checkUser - A function that checks if a user with a given email exists.
 * - CheckUserInputSchema - The input type for the checkUser function.
 * - CheckUserOutputSchema - The return type for the checkUser function.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CheckUserInputSchema, CheckUserOutputSchema } from '@/lib/types';


async function performCheck(email: string): Promise<{ authorized: boolean }> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    return { authorized: !querySnapshot.empty };
  } catch (error) {
    console.error("Error checking user in Firestore:", error);
    // In case of a database error, default to unauthorized for security.
    return { authorized: false };
  }
}

const checkUserFlow = ai.defineFlow(
  {
    name: 'checkUserFlow',
    inputSchema: CheckUserInputSchema,
    outputSchema: CheckUserOutputSchema,
  },
  async ({ email }) => {
    return await performCheck(email);
  }
);

export async function checkUser(email: string): Promise<{ authorized: boolean }> {
    return await checkUserFlow({ email });
}
