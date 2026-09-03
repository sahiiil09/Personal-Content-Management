import {
  initializeApp,
  getApps,
  getApp,
  type FirebaseApp,
} from 'firebase/app';

import {
  getAuth,
  type Auth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
} from 'firebase/auth';

import {
  getFirestore,
  type Firestore,
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
  onSnapshot,
} from 'firebase/firestore';

import type { FirebaseConfig } from '../types';


// ========================================
// ADMIN SETTINGS
// ========================================

export const AUTHORIZED_ADMIN_UID =
  'ZZgG3hnhSyZYWdQG3xt0MPaCaqZ2';

export const ADMIN_EMAIL =
  'sayyedsahil9017@gmail.com';


// ========================================
// FIREBASE CONFIG
// ========================================

const firebaseConfig = {
  apiKey: 'AIzaSyCIVbVFkHMB6LhTvG6dXhcVfKBN2_Hvmn0',

  authDomain:
    'my-personal-dashboard-9fad0.firebaseapp.com',

  projectId:
    'my-personal-dashboard-9fad0',

  storageBucket:
    'my-personal-dashboard-9fad0.firebasestorage.app',

  messagingSenderId:
    '23284352702',

  appId:
    '1:23284352702:web:4f16293be812e1e8eb00ef',

  measurementId:
    'G-1NNDRLFG1R',
};


// ========================================
// FIREBASE INSTANCES
// ========================================

let app: FirebaseApp | null = null;

let auth: Auth | null = null;

let db: Firestore | null = null;


// ========================================
// CHECK FIREBASE CONFIG
// ========================================

export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.authDomain
  );
};


// ========================================
// INITIALIZE FIREBASE
// ========================================

export const initFirebase = (): void => {
  try {

    if (!app) {

      if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
      } else {
        app = getApp();
      }

      auth = getAuth(app);
      db = getFirestore(app);
    }

    console.log(
      'Firebase Auth & Firestore initialized successfully:',
      firebaseConfig.projectId
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


// ========================================
// AUTO INITIALIZE
// ========================================

initFirebase();


// ========================================
// EXPORT FIREBASE SERVICES
// ========================================

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

  onSnapshot,
};


// ========================================
// COMPATIBILITY FUNCTIONS
// ========================================

export const getActiveFirebaseConfig =
  (): Partial<FirebaseConfig> => {

    return {
      apiKey: firebaseConfig.apiKey,
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId,
      messagingSenderId:
        firebaseConfig.messagingSenderId,
      appId: firebaseConfig.appId,
    };
  };


// This is kept only so existing code
// does not break.

export const saveCustomFirebaseConfig = (
  _config: FirebaseConfig
): void => {

  console.warn(
    'Custom Firebase config is disabled. Using the configured Firebase project.'
  );
};


// This is kept only so existing code
// does not break.

export const clearCustomFirebaseConfig =
  (): void => {

    console.warn(
      'Firebase config cannot be cleared.'
    );
  };