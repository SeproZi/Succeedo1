
'use server';
/**
 * @fileOverview Suggests key results for a given objective.
 * 
 * - suggestKeyResults - A function that suggests key results.
 */

import { ai } from '@/ai/genkit';
import { SuggestKeyResultsInputSchema, SuggestKeyResultsOutputSchema } from '@/lib/types';

const prompt = ai.definePrompt({
    name: 'suggestKeyResultsPrompt',
    input: { schema: SuggestKeyResultsInputSchema },
    output: { schema: SuggestKeyResultsOutputSchema },
    prompt: `You are an expert in setting Objectives and Key Results (OKRs). 
    
    Given the following objective title, please generate 3 to 5 clear, specific, and measurable key results to track progress towards it.

    Objective: {{{objectiveTitle}}}
    
    Return the key results as an array of strings.`,
});

export const suggestKeyResults = ai.defineFlow(
    {
        name: 'suggestKeyResults',
        inputSchema: SuggestKeyResultsInputSchema,
        outputSchema: SuggestKeyResultsOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
)
