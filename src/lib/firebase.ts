import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { Auth, getAuth, GoogleAuthProvider } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";

// Firebase configuration object
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
};

// Debug logging for browser
if (typeof window !== 'undefined') {
  console.log('Firebase Environment Variables Check:', {
    apiKey: firebaseConfig.apiKey ? 'Set' : 'Missing',
    authDomain: firebaseConfig.authDomain ? 'Set' : 'Missing', 
    projectId: firebaseConfig.projectId ? 'Set' : 'Missing',
    appId: firebaseConfig.appId ? 'Set' : 'Missing',
    actualValues: {
      apiKey: firebaseConfig.apiKey || 'undefined',
      authDomain: firebaseConfig.authDomain || 'undefined',
      projectId: firebaseConfig.projectId || 'undefined'
    }
  });
}

// Validate that we have the minimum required configuration
const hasRequiredConfig = !!(
  firebaseConfig.apiKey && 
  firebaseConfig.authDomain && 
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let googleProvider: GoogleAuthProvider;

if (hasRequiredConfig) {
  try {
    // Initialize Firebase app
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    
    // Initialize services
    auth = getAuth(app);
    db = getFirestore(app);
    
    // Configure Google Auth Provider
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({
      prompt: "consent",
    });
    
    if (typeof window !== 'undefined') {
      console.log('Firebase initialized successfully');
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
} else {
  console.error('Firebase configuration incomplete. Missing required environment variables.');
  console.error('Required variables: NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_PROJECT_ID, NEXT_PUBLIC_FIREBASE_APP_ID');
  console.error('Current config:', firebaseConfig);
}

export { app, auth, db, googleProvider };
