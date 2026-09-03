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

export const ADMIN_EMAIL =
  ((import.meta as any).env?.VITE_ADMIN_EMAIL) ||
  'sayyedsahil9017@gmail.com';


// ================================
// GET FIREBASE CONFIG
// ================================

const getStoredConfig = (): Partial<FirebaseConfig> => {
  try {
    const customConfig = localStorage.getItem(
      'pcm_custom_firebase_config'
    );

    if (customConfig) {
      return JSON.parse(customConfig);
    }
  } catch (error) {
    console.warn(
      'Could not parse stored Firebase config',
      error
    );
  }

  const env = (import.meta as any).env || {};

  return {
    apiKey: env.VITE_FIREBASE_API_KEY || '',
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: env.VITE_FIREBASE_PROJECT_ID || '',
    messagingSenderId:
      env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: env.VITE_FIREBASE_APP_ID || '',
  };
};


// ================================
// CURRENT CONFIG
// ================================

let currentConfig: Partial<FirebaseConfig> =
  getStoredConfig();


// ================================
// CHECK FIREBASE CONFIGURATION
// ================================

export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    currentConfig.apiKey &&
    currentConfig.authDomain &&
    currentConfig.projectId &&
    currentConfig.messagingSenderId &&
    currentConfig.appId
  );
};


// Debug check

console.log('Firebase Config Check:', {
  projectId: currentConfig.projectId,
  hasApiKey: !!currentConfig.apiKey,
  authDomain: currentConfig.authDomain,
  configured: isFirebaseConfigured(),
});


// ================================
// FIREBASE VARIABLES
// ================================

let app: FirebaseApp | null = null;

let auth: Auth | null = null;

let db: Firestore | null = null;


// ================================
// INITIALIZE FIREBASE
// ================================

export const initFirebase = () => {

  if (!isFirebaseConfigured()) {

    console.warn(
      'Firebase is NOT configured. Check your .env file.'
    );

    return;
  }

  try {

    if (!getApps().length) {

      app = initializeApp(
        currentConfig as FirebaseConfig
      );

    } else {

      app = getApp();

    }

    auth = getAuth(app);

    db = getFirestore(app);

    console.log(
      'Firebase Auth & Firestore initialized successfully:',
      currentConfig.projectId
    );

  } catch (error) {

    console.error(
      'Firebase initialization error:',
      error
    );

    app = null;

    auth = null;

    db = null;

  }

};


// ================================
// AUTO INITIALIZE
// ================================

initFirebase();


// ================================
// EXPORT FIREBASE SERVICES
// ================================

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


// ================================
// CUSTOM CONFIG FUNCTIONS
// ================================

export const saveCustomFirebaseConfig = (
  config: FirebaseConfig
) => {

  localStorage.setItem(
    'pcm_custom_firebase_config',
    JSON.stringify(config)
  );

  currentConfig = config;

  initFirebase();

};


export const clearCustomFirebaseConfig = () => {

  localStorage.removeItem(
    'pcm_custom_firebase_config'
  );

  currentConfig = getStoredConfig();

  initFirebase();

};


export const getActiveFirebaseConfig =
  (): Partial<FirebaseConfig> => {

    return {
      ...currentConfig
    };

  };