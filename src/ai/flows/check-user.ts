
'use server';
/**
 * @fileOverview Checks if a user is authorized.
 * 
 * - checkUser - A function that checks if a user's email is in the authorized list.
 * - CheckUserInput - The input type for the checkUser function.
 * - CheckUserOutput - The return type for the checkUser function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';


export const CheckUserInputSchema = z.object({
  email: z.string().describe('The email address to check.'),
});
export type CheckUserInput = z.infer<typeof CheckUserInputSchema>;

export const CheckUserOutputSchema = z.object({
    isAuthorized: z.boolean().describe('Whether the user is authorized or not.'),
});
export type CheckUserOutput = z.infer<typeof CheckUserOutputSchema>;


export const checkUser = ai.defineFlow(
    {
        name: 'checkUser',
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
