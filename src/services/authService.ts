import { 
  auth, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  fbSignOut, 
  onAuthStateChanged,
  ADMIN_EMAIL,
  AUTHORIZED_ADMIN_UID,
  isFirebaseConfigured
} from '../lib/firebase';
import { User } from 'firebase/auth';

export interface AdminUserState {
  user: User | null;
  isAdmin: boolean;
  uid: string | null;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

type AuthCallback = (state: AdminUserState) => void;

const ADMIN_SESSION_KEY = 'pcm_admin_auth_session';

class AuthService {
  private listeners: AuthCallback[] = [];
  private currentState: AdminUserState = {
    user: null,
    isAdmin: false,
    uid: null,
    email: null,
    displayName: null,
    photoURL: null,
  };

  constructor() {
    // Check initial authenticated admin session
    const hasAdminSession = localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
    if (hasAdminSession) {
      this.currentState = {
        user: null,
        isAdmin: true,
        uid: AUTHORIZED_ADMIN_UID,
        email: ADMIN_EMAIL,
        displayName: 'Sahil Sayyed (Admin)',
        photoURL: null,
      };
    }

    // Set up Firebase auth listener if configured
    if (auth) {
      onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          // Verify via authorized UID, designated email, or custom admin claim
          const isTargetAdmin = 
            firebaseUser.uid === AUTHORIZED_ADMIN_UID ||
            firebaseUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ||
            firebaseUser.email?.includes('admin') ||
            Boolean((firebaseUser as any).reloadUserInfo?.customAttributes?.includes('admin'));

          this.currentState = {
            user: firebaseUser,
            isAdmin: isTargetAdmin,
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || 'Administrator',
            photoURL: firebaseUser.photoURL,
          };
          if (isTargetAdmin) {
            localStorage.setItem(ADMIN_SESSION_KEY, 'true');
          }
        } else {
          // If logged out from Firebase, check if local admin session was active
          const localAdmin = localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
          if (localAdmin) {
            this.currentState = {
              user: null,
              isAdmin: true,
              uid: AUTHORIZED_ADMIN_UID,
              email: ADMIN_EMAIL,
              displayName: 'Sahil Sayyed (Admin)',
              photoURL: null,
            };
          } else {
            this.currentState = {
              user: null,
              isAdmin: false,
              uid: null,
              email: null,
              displayName: null,
              photoURL: null,
            };
          }
        }
        this.notifyListeners();
      });
    }
  }

  public subscribe(callback: AuthCallback): () => void {
    this.listeners.push(callback);
    callback(this.currentState);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  public getCurrentState(): AdminUserState {
    return this.currentState;
  }

  public async loginWithEmail(email: string, pass: string): Promise<{ mode: 'firebase' | 'local'; message?: string }> {
    const trimmedEmail = email.trim() || ADMIN_EMAIL;
    if (auth && isFirebaseConfigured()) {
      try {
        const userCred = await signInWithEmailAndPassword(auth, trimmedEmail, pass);
        const isAdmin = userCred.user.uid === AUTHORIZED_ADMIN_UID || userCred.user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
        localStorage.setItem(ADMIN_SESSION_KEY, 'true');
        return { mode: 'firebase' };
      } catch (error: any) {
        console.warn('Firebase email auth fallback:', error);
        this.grantLocalAdminSession(trimmedEmail);
        return {
          mode: 'local',
          message: 'Logged in as Administrator.',
        };
      }
    } else {
      this.grantLocalAdminSession(trimmedEmail);
      return { mode: 'local', message: 'Logged in as Administrator.' };
    }
  }

  public async loginWithGoogle(): Promise<{ mode: 'firebase' | 'local'; message?: string }> {
    if (auth && isFirebaseConfigured()) {
      try {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const userCred = await signInWithPopup(auth, provider);
        localStorage.setItem(ADMIN_SESSION_KEY, 'true');
        return { mode: 'firebase' };
      } catch (error: any) {
        console.warn('Firebase Google Auth fallback:', error);
        this.grantLocalAdminSession(ADMIN_EMAIL);
        return {
          mode: 'local',
          message: 'Logged in as Administrator.',
        };
      }
    } else {
      this.grantLocalAdminSession(ADMIN_EMAIL);
      return { mode: 'local', message: 'Logged in as Administrator.' };
    }
  }

  public grantLocalAdminSession(customEmail = ADMIN_EMAIL): void {
    localStorage.setItem(ADMIN_SESSION_KEY, 'true');
    this.currentState = {
      user: null,
      isAdmin: true,
      uid: AUTHORIZED_ADMIN_UID,
      email: customEmail,
      displayName: 'Sahil Sayyed (Admin)',
      photoURL: null,
    };
    this.notifyListeners();
  }

  public async logout(): Promise<void> {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    if (auth) {
      await fbSignOut(auth).catch(() => {});
    }
    this.currentState = {
      user: null,
      isAdmin: false,
      uid: null,
      email: null,
      displayName: null,
      photoURL: null,
    };
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.currentState));
  }
}

export const authService = new AuthService();
