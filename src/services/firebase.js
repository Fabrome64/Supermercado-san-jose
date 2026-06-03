import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Helper to load config from localStorage (enables user configuration from Admin UI)
export const getFirebaseConfig = () => {
  const saved = localStorage.getItem('sanjose_firebase_config');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Error parsing saved Firebase config:', e);
    }
  }
  return null;
};

let app = null;
let firestore = null;
let auth = null;
let isFirebaseEnabled = false;

const config = getFirebaseConfig();

if (config && config.apiKey && config.projectId) {
  try {
    if (getApps().length === 0) {
      app = initializeApp(config);
    } else {
      app = getApp();
    }
    firestore = getFirestore(app);
    auth = getAuth(app);
    isFirebaseEnabled = true;
    console.log('Firebase initialized successfully from user settings.');
  } catch (error) {
    console.error('Failed to initialize Firebase with current config:', error);
  }
}

export { app, firestore, auth, isFirebaseEnabled };
