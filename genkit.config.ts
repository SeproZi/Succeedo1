
import {firebase} from '@genkit-ai/firebase';
import {googleAI} from '@genkit-ai/googleai';
import {genkit} from 'genkit';

export default genkit({
  plugins: [
    firebase(),
    googleAI(),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
