'use server';
/**
 * @fileOverview A flow to suggest key results for a given objective.
 * 
 * - suggestKeyResults - A function that suggests key results for an objective.
 * - SuggestKeyResultsInputSchema - The input type for the suggestKeyResults function.
 * - SuggestKeyResultsOutputSchema - The return type for the suggestKeyResults function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { SuggestKeyResultsInputSchema, SuggestKeyResultsOutputSchema, SuggestKeyResultsInput, SuggestKeyResultsOutput } from '@/lib/types';


const prompt = ai.definePrompt({
  name: 'suggestKeyResultsPrompt',
  input: { schema: SuggestKeyResultsInputSchema },
  output: { schema: SuggestKeyResultsOutputSchema },
  prompt: `You are an expert in creating OKRs (Objectives and Key Results). 
  
  Given the following objective title, please suggest 3-5 relevant and measurable key results.
  
  Objective: {{{objectiveTitle}}}`,
});

const suggestKeyResultsFlow = ai.defineFlow(
  {
    name: 'suggestKeyResultsFlow',
    inputSchema: SuggestKeyResultsInputSchema,
    outputSchema: SuggestKeyResultsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

export async function suggestKeyResults(input: SuggestKeyResultsInput): Promise<SuggestKeyResultsOutput> {
    return await suggestKeyResultsFlow(input);
}
