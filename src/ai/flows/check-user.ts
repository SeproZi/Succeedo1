
'use server';
/**
 * @fileOverview Checks if a user is authorized.
 * 
 * - checkUser - A function that checks if a user's email is in the authorized list.
 */

import { ai } from '@/ai/genkit';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CheckUserInputSchema, CheckUserOutputSchema, type CheckUserInput, type CheckUserOutput } from '@/lib/types';


const checkUserFlow = ai.defineFlow(
    {
        name: 'checkUserFlow',
        inputSchema: CheckUserInputSchema,
        outputSchema: CheckUserOutputSchema,
    },
    async (input) => {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", input.email));
        const querySnapshot = await getDocs(q);

        return {
            isAuthorized: !querySnapshot.empty
        };
    }
);

export async function checkUser(input: CheckUserInput): Promise<CheckUserOutput> {
    return checkUserFlow(input);
}
