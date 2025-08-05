'use server';

import { suggestKeyResults } from "@/ai/flows/suggest-key-results";
import type { OkrItem } from "./types";

export async function suggestKeyResultsAction(objective: OkrItem): Promise<string[]> {
    try {
        const result = await suggestKeyResults({ objectiveTitle: objective.title });
        return result.keyResults;
    } catch (error) {
        console.error('Error suggesting key results:', error);
        return [];
    }
}
