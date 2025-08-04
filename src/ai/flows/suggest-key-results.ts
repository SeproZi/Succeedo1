'use server';

/**
 * @fileOverview Provides AI-powered suggestions for Key Results based on a given Objective.
 *
 * - suggestKeyResults - A function that suggests key results for a given objective.
 * - SuggestKeyResultsInput - The input type for the suggestKeyResults function.
 * - SuggestKeyResultsOutput - The return type for the suggestKeyResults function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestKeyResultsInputSchema = z.object({
  objective: z.string().describe('The objective for which to suggest key results.'),
});
export type SuggestKeyResultsInput = z.infer<typeof SuggestKeyResultsInputSchema>;

const SuggestKeyResultsOutputSchema = z.object({
  keyResults: z.array(z.string()).describe('An array of suggested key results.'),
});
export type SuggestKeyResultsOutput = z.infer<typeof SuggestKeyResultsOutputSchema>;

export async function suggestKeyResults(input: SuggestKeyResultsInput): Promise<SuggestKeyResultsOutput> {
  return suggestKeyResultsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestKeyResultsPrompt',
  input: {schema: SuggestKeyResultsInputSchema},
  output: {schema: SuggestKeyResultsOutputSchema},
  prompt: `You are an AI assistant that suggests key results for a given objective.  The key results should be specific, measurable, achievable, relevant, and time-bound (SMART).

  Objective: {{{objective}}}

  Suggest 3-5 key results as strings in a JSON array.`,
});

const suggestKeyResultsFlow = ai.defineFlow(
  {
    name: 'suggestKeyResultsFlow',
    inputSchema: SuggestKeyResultsInputSchema,
    outputSchema: SuggestKeyResultsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
