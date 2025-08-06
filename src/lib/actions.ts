'use server';

import { suggestKeyResults, SuggestKeyResultsOutput } from "@/ai/flows/suggest-key-results";
import { checkUser as checkUserFlow, CheckUserInput, CheckUserOutput } from "@/ai/flows/check-user";

export async function suggestKeyResultsAction(objectiveTitle: string): Promise<SuggestKeyResultsOutput> {
    try {
        const result = await suggestKeyResults({ objectiveTitle });
        return result;
    } catch (error) {
        console.error('Error suggesting key results:', error);
        return { keyResults: [] };
    }
}

export async function checkUserAction(input: CheckUserInput): Promise<CheckUserOutput> {
    try {
        const result = await checkUserFlow(input);
        return result;
    } catch (error) {
        console.error('Error checking user:', error);
        return { isAuthorized: false };
    }
}
