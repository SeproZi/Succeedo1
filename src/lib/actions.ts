'use server';

import { suggestKeyResults, SuggestKeyResultsOutput } from "@/ai/flows/suggest-key-results";
import type { OkrItem } from "./types";

export async function suggestKeyResultsAction(objectiveTitle: string): Promise<SuggestKeyResultsOutput> {
    try {
        const result = await suggestKeyResults({ objectiveTitle });
        return result;
    } catch (error) {
        console.error('Error suggesting key results:', error);
        return { keyResults: [] };
    }
}
