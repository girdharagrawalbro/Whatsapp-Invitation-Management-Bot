import React, { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import type { AdminUser } from '../store/useAuthStore';

// Keep the same interface mapping for existing imports
export type Organization = AdminUser;

interface AuthContextType {
  isAuthenticated: boolean;
  user: Organization | null;
  loading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return <>{children}</>;
};

export const useAuth = (): AuthContextType => {
  const { isAuthenticated, user, loading, login, logout } = useAuthStore();
  return {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
  };
};