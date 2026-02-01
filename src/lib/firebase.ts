import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Use Vite env variables (prefixed with VITE_) for client-side runtime
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase safely (analytics may fail in some environments)
const app = initializeApp(firebaseConfig as any);
let analytics: ReturnType<typeof getAnalytics> | null = null;
try {
  // Only attempt analytics when measurement id is provided
  if (firebaseConfig.measurementId) {
    analytics = getAnalytics(app);
  }
} catch (e) {
  // Ignore analytics errors in non-browser environments
  analytics = null;
}

const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };
