
import dotenv from 'dotenv';
import path from 'path';

// Explicitly load variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const required = ['NEXT_PUBLIC_FIREBASE_API_KEY', 'NEXT_PUBLIC_FIREBASE_PROJECT_ID', 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'];
const missing = required.filter(k => !process.env[k] && !process.env.FIREBASE_WEBAPP_CONFIG);

if (missing.length) {
  console.error('Missing required environment variables from .env.local:', missing);
  process.exit(1);
}
