'use server';

import { suggestKeyResults as suggestKeyResultsFlow } from '@/ai/flows/suggest-key-results';
import type { SuggestKeyResultsInput } from '@/ai/flows/suggest-key-results';

export async function suggestKeyResultsAction(input: SuggestKeyResultsInput) {
  try {
    const result = await suggestKeyResultsFlow(input);
    return { keyResults: result.keyResults };
  } catch (error) {
    console.error('AI suggestion failed:', error);
    return { error: 'Failed to get AI suggestions. Please try again.' };
  }
}
