import { getApps, initializeApp, applicationDefault, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

let adminApp: App;

if (!getApps().length) {
  // App Hosting provides ADC; set projectId defensively from env if needed
  const projectId =
    process.env.GOOGLE_CLOUD_PROJECT ||
    (process.env.FIREBASE_CONFIG ? JSON.parse(process.env.FIREBASE_CONFIG).projectId : undefined);

  adminApp = initializeApp({ credential: applicationDefault(), projectId });
} else {
  // If app is already initialized, get the default app
  adminApp = getApps()[0];
}

const adminAuth = getAuth(adminApp);

export { adminAuth };