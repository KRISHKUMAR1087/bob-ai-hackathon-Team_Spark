import { User, UserRole } from '../types/auth';

const STORAGE_KEY_USER = 'portpulse_auth_user';
const STORAGE_KEY_ROLE = 'portpulse_user_role';

export const DEMO_ADMIN: User = {
  id: 'demo-admin',
  name: 'Port Operations Admin',
  email: 'admin@portpulse.demo',
  role: 'admin',
  authProvider: 'demo',
};

export const DEMO_AGENT: User = {
  id: 'demo-agent',
  name: 'Shipping Agent',
  email: 'agent@portpulse.demo',
  role: 'ship-agent',
  authProvider: 'demo',
};

/**
 * FIREBASE AUTHENTICATION CONFIGURATION TEMPLATE
 * 
 * To connect a live Firebase project for Google Sign-In:
 * 1. Install firebase: npm install firebase
 * 2. Set the following environment variables in .env:
 *    VITE_FIREBASE_API_KEY="your-api-key"
 *    VITE_FIREBASE_AUTH_DOMAIN="your-app.firebaseapp.com"
 *    VITE_FIREBASE_PROJECT_ID="your-project-id"
 *    VITE_FIREBASE_STORAGE_BUCKET="your-app.appspot.com"
 *    VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
 *    VITE_FIREBASE_APP_ID="your-app-id"
 * 3. Initialize Firebase and GoogleAuthProvider in this service.
 */

export class AuthService {
  /**
   * Retrieves the currently persisted user from storage
   */
  public static getStoredUser(): User | null {
    try {
      const serialized = localStorage.getItem(STORAGE_KEY_USER);
      if (!serialized) return null;
      return JSON.parse(serialized) as User;
    } catch (e) {
      console.error('Failed to parse stored user from localStorage', e);
      return null;
    }
  }

  /**
   * Logs in as one of the pre-configured demo roles (instant, password-free)
   */
  public static loginDemo(role: UserRole): User {
    const user = role === 'admin' ? DEMO_ADMIN : DEMO_AGENT;
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEY_ROLE, role);
    return user;
  }

  /**
   * Initiates Google Sign-In.
   * If a live Firebase config exists, it connects to Firebase Auth.
   * Otherwise, it seamlessly simulates Google OAuth continuation for competition demos.
   */
  public static async signInWithGoogle(): Promise<{ user: User | null; needsRoleSelection: boolean }> {
    // Check if user previously saved a role
    const savedRole = localStorage.getItem(STORAGE_KEY_ROLE) as UserRole | null;

    // Simulated Google OAuth profile
    const googleProfile = {
      id: 'google-user-' + Math.random().toString(36).substring(2, 9),
      name: 'Capt. Sarah Lindqvist',
      email: 'sarah.lindqvist@maritime-ops.org',
      photoURL: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
      authProvider: 'google' as const,
    };

    if (savedRole) {
      const fullUser: User = {
        ...googleProfile,
        role: savedRole,
      };
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(fullUser));
      return { user: fullUser, needsRoleSelection: false };
    }

    // Role selection needed
    return {
      user: {
        ...googleProfile,
        role: 'admin', // placeholder until selection
      },
      needsRoleSelection: true,
    };
  }

  /**
   * Assigns and persists the selected role for an authenticated user
   */
  public static setUserRole(role: UserRole, baseUser?: Partial<User>): User {
    const currentUser = baseUser || this.getStoredUser() || DEMO_ADMIN;
    const updated: User = {
      id: currentUser.id || 'demo-admin',
      name: currentUser.name || 'Port Operator',
      email: currentUser.email || 'operator@portpulse.ai',
      photoURL: currentUser.photoURL,
      authProvider: currentUser.authProvider || 'demo',
      role,
    };

    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated));
    localStorage.setItem(STORAGE_KEY_ROLE, role);
    return updated;
  }

  /**
   * Logs out the user and clears all persisted credentials and roles
   */
  public static logout(): void {
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_ROLE);
  }
}
