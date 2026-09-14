import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/auth';
import { AuthService } from '../services/authService';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginAsDemo: (role: UserRole) => User;
  loginWithGoogle: () => Promise<{ needsRoleSelection: boolean; tempUser: User | null }>;
  confirmRoleSelection: (role: UserRole, tempUser?: User | null) => User;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Hydrate authenticated user session on mount
  useEffect(() => {
    const stored = AuthService.getStoredUser();
    if (stored) {
      setUser(stored);
    }
    setIsLoading(false);
  }, []);

  const loginAsDemo = (role: UserRole): User => {
    const loggedInUser = AuthService.loginDemo(role);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const loginWithGoogle = async (): Promise<{ needsRoleSelection: boolean; tempUser: User | null }> => {
    setIsLoading(true);
    try {
      const result = await AuthService.signInWithGoogle();
      if (!result.needsRoleSelection && result.user) {
        setUser(result.user);
        return { needsRoleSelection: false, tempUser: null };
      }
      return { needsRoleSelection: true, tempUser: result.user };
    } finally {
      setIsLoading(false);
    }
  };

  const confirmRoleSelection = (role: UserRole, tempUser?: User | null): User => {
    const confirmedUser = AuthService.setUserRole(role, tempUser || undefined);
    setUser(confirmedUser);
    return confirmedUser;
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
        loginWithGoogle,
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
