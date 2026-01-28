import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBBNgCWYR2CBsxqFH9b2FEa9-1zMCQv1s8",
  authDomain: "codepath-3ea5e.firebaseapp.com",
  projectId: "codepath-3ea5e",
  storageBucket: "codepath-3ea5e.firebasestorage.app",
  messagingSenderId: "342695932241",
  appId: "1:342695932241:web:8f7e60f0e92b786470a370",
  measurementId: "G-K9L77YFQY2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };
