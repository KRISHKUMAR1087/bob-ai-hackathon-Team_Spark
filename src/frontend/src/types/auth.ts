export type UserRole = 'admin' | 'ship-agent' | 'super-admin';
export type AuthProviderType = 'demo' | 'google' | 'email';

export interface User {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  role: UserRole;
  authProvider: AuthProviderType;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
