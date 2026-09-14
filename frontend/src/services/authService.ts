import { User, UserRole } from '../types/auth';
import { apiClient } from './apiClient';

const STORAGE_KEY_USER = 'portpulse_auth_user';
const STORAGE_KEY_ROLE = 'portpulse_user_role';
const STORAGE_KEY_TOKEN = 'portpulse_token';

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
   * Logs in as one of the pre-configured demo roles using the real backend API.
   */
  public static async loginDemo(role: UserRole): Promise<User> {
    const response = await apiClient.post('/auth/login-demo', { role });
    
    // Save token and user
    localStorage.setItem(STORAGE_KEY_TOKEN, response.token);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(response.user));
    localStorage.setItem(STORAGE_KEY_ROLE, response.user.role);
    
    return response.user;
  }

  /**
   * Completes Google Sign-In with the backend using the idToken.
   */
  public static async signInWithGoogleToken(idToken: string): Promise<{ user: User | null; needsRoleSelection: boolean }> {
    const response = await apiClient.post('/auth/google', { idToken });
    
    if (response.requiresRoleSelection) {
      // User is new and needs to select a role. The token returned is a temporary token 
      // with a placeholder role, so we just return the temp user.
      localStorage.setItem(STORAGE_KEY_TOKEN, response.token);
      return { user: response.user, needsRoleSelection: true };
    } else {
      // User already existed and has a role.
      localStorage.setItem(STORAGE_KEY_TOKEN, response.token);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(response.user));
      localStorage.setItem(STORAGE_KEY_ROLE, response.user.role);
      return { user: response.user, needsRoleSelection: false };
    }
  }

  /**
   * Assigns and persists the selected role for a newly authenticated user.
   */
  public static async setUserRole(role: UserRole): Promise<User> {
    // The backend should use the existing JWT token from signInWithGoogleToken to authenticate this request.
    const response = await apiClient.post('/auth/role', { role });
    
    localStorage.setItem(STORAGE_KEY_TOKEN, response.token);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(response.user));
    localStorage.setItem(STORAGE_KEY_ROLE, response.user.role);
    
    return response.user;
  }

  /**
   * Hydrates the user session securely by checking with the backend.
   */
  public static async fetchMe(): Promise<User | null> {
    const token = localStorage.getItem(STORAGE_KEY_TOKEN);
    if (!token) return null;
    
    try {
      const response = await apiClient.get('/auth/me');
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(response.user));
      return response.user;
    } catch (e) {
      console.error('Failed to fetch user', e);
      this.logout();
      return null;
    }
  }

  /**
   * Logs out
   */
  public static logout(): void {
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_ROLE);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
  }
}
