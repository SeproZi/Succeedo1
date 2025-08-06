
import {firebase} from '@genkit-ai/firebase';
import {googleAI} from '@genkit-ai/googleai';
import {genkit} from 'genkit';
import {defineDotprompt, dotprompt} from 'genkit/dotprompt';

defineDotprompt(
    {
      name: 'promptWithTools',
      model: 'googleai/gemini-pro',
      input: {
        schema: {
          input: 'string',
        },
      },
      output: {
        format: 'text',
      },
      config: {
        temperature: 1,
      },
    },
    'You are a helpful AI assistant. Please answer the user\'s question: {{input}}'
);

export default genkit({
  plugins: [
    firebase(),
    googleAI(),
    dotprompt(),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
