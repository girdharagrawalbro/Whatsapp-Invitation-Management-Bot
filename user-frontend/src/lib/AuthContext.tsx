import React, { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import toast from 'react-hot-toast';
import api from './api';

interface Organization {
  _id: string;
  name: string;
  adminPhone: string;
  role: 'admin' | 'user' | 'superadmin';
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: Organization | null;
  loading: boolean;
  login: (phone: string, password: string, language?: string) => Promise<void>;
  signup: (name: string, phone: string, password: string, language?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await api.get('/organizations/me');
      if (response.data) {
        setIsAuthenticated(true);
        setUser(response.data);
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (phone: string, password: string, language?: string) => {
    try {
      const response = await api.post('/organizations/login', { 
        phone, 
        password, 
        language: language?.toLowerCase() 
      });
      setIsAuthenticated(true);
      setUser(response.data.organization);
      toast.success('Login Successful');
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Login failed';
      toast.error(msg);
      throw error;
    }
  };

  const signup = async (name: string, phone: string, password: string, language?: string, email?: string) => {
    try {
      const response = await api.post('/organizations/signup', { 
        name, 
        phone, 
        password, 
        email,
        language: language?.toLowerCase() 
      });
      setIsAuthenticated(true);
      setUser(response.data.organization);
      toast.success('Account created successfully!');
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Signup failed';
      toast.error(msg);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/organizations/logout');
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout error', error);
      setIsAuthenticated(false);
      setUser(null);
    }
  };


  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 