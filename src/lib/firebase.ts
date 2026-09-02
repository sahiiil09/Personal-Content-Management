import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  Auth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as fbSignOut,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  Firestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { FirebaseConfig } from '../types';

export const AUTHORIZED_ADMIN_UID = 'ZZgG3hnhSyZYWdQG3xt0MPaCaqZ2';
export const ADMIN_EMAIL = ((import.meta as any).env?.VITE_ADMIN_EMAIL) || 'sayyedsahil9017@gmail.com';

// Read config from Vite environment variables or localStorage override
const getStoredConfig = (): Partial<FirebaseConfig> => {
  try {
    const customConfig = localStorage.getItem('pcm_custom_firebase_config');
    if (customConfig) {
      return JSON.parse(customConfig);
    }
  } catch (e) {
    console.warn('Could not parse stored Firebase config', e);
  }

  const env = (import.meta as any).env || {};

  return {
    apiKey: env.VITE_FIREBASE_API_KEY || '',
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: env.VITE_FIREBASE_PROJECT_ID || '',
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: env.VITE_FIREBASE_APP_ID || '',
  };
};

let currentConfig: Partial<FirebaseConfig> = getStoredConfig();

export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    currentConfig.apiKey && 
    currentConfig.projectId && 
    currentConfig.apiKey.length > 5
  );
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

export const initFirebase = () => {
  if (isFirebaseConfigured()) {
    try {
      if (!getApps().length) {
        app = initializeApp(currentConfig as FirebaseConfig);
      } else {
        app = getApp();
      }
      auth = getAuth(app);
      db = getFirestore(app);
      console.log('Firebase Auth & Firestore initialized for project:', currentConfig.projectId);
    } catch (error) {
      console.warn('Firebase initialization error, falling back to local store:', error);
      app = null;
      auth = null;
      db = null;
    }
  }
};

// Auto-run initialization
initFirebase();

export { 
  app, 
  auth, 
  db, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  fbSignOut, 
  onAuthStateChanged,
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot
};

export const saveCustomFirebaseConfig = (config: FirebaseConfig) => {
  localStorage.setItem('pcm_custom_firebase_config', JSON.stringify(config));
  currentConfig = config;
  initFirebase();
};

export const clearCustomFirebaseConfig = () => {
  localStorage.removeItem('pcm_custom_firebase_config');
  currentConfig = getStoredConfig();
  initFirebase();
};

export const getActiveFirebaseConfig = (): Partial<FirebaseConfig> => {
  return { ...currentConfig };
};
