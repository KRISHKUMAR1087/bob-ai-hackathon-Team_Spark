import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/auth';
import { AuthService } from '../services/authService';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginAsDemo: (role: UserRole) => Promise<User>;
  loginWithGoogleToken: (idToken: string) => Promise<{ needsRoleSelection: boolean; tempUser: User | null }>;
  confirmRoleSelection: (role: UserRole) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Hydrate authenticated user session on mount
  useEffect(() => {
    const hydrate = async () => {
      try {
        // First optimistic check from local storage
        const stored = AuthService.getStoredUser();
        if (stored) {
          setUser(stored);
        }
        
        // Then verify with backend
        const fetched = await AuthService.fetchMe();
        if (fetched) {
          setUser(fetched);
        } else if (stored) {
          // Token was invalid
          setUser(null);
        }
      } catch (e) {
        console.error('Auth hydration failed:', e);
        // If backend is unreachable, still use stored user if available
        const stored = AuthService.getStoredUser();
        if (stored) {
          setUser(stored);
        }
      } finally {
        setIsLoading(false);
      }
    };
    hydrate();
  }, []);

  const loginAsDemo = async (role: UserRole): Promise<User> => {
    setIsLoading(true);
    try {
      const loggedInUser = await AuthService.loginDemo(role);
      setUser(loggedInUser);
      return loggedInUser;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogleToken = async (idToken: string): Promise<{ needsRoleSelection: boolean; tempUser: User | null }> => {
    setIsLoading(true);
    try {
      const result = await AuthService.signInWithGoogleToken(idToken);
      if (!result.needsRoleSelection && result.user) {
        setUser(result.user);
        return { needsRoleSelection: false, tempUser: null };
      }
      return { needsRoleSelection: true, tempUser: result.user };
    } finally {
      setIsLoading(false);
    }
  };

  const confirmRoleSelection = async (role: UserRole): Promise<User> => {
    setIsLoading(true);
    try {
      const confirmedUser = await AuthService.setUserRole(role);
      setUser(confirmedUser);
      return confirmedUser;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        loginAsDemo,
        loginWithGoogleToken,
        confirmRoleSelection,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
