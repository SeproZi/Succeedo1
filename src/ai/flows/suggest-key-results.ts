'use server';
/**
 * @fileOverview Suggests key results for a given objective.
 * 
 * - suggestKeyResults - A function that suggests key results.
 * - SuggestKeyResultsInput - The input type for the suggestKeyResults function.
 * - SuggestKeyResultsOutput - The return type for the suggestKeyResults function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SuggestKeyResultsInputSchema = z.object({
  objectiveTitle: z.string().describe('The title of the objective.'),
});
export type SuggestKeyResultsInput = z.infer<typeof SuggestKeyResultsInputSchema>;

const SuggestKeyResultsOutputSchema = z.object({
    keyResults: z.array(z.string()).describe('An array of 3-5 suggested key results.'),
});
export type SuggestKeyResultsOutput = z.infer<typeof SuggestKeyResultsOutputSchema>;


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
