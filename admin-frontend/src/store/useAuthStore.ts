import { create } from 'zustand';
import toast from 'react-hot-toast';
import { adminapi } from '../lib/api';

export interface AdminUser {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'admin';
  createdAt?: string;
  openwa?: {
    sessionId: string | null;
    status: string | null;
    phone: string | null;
  };
}

interface AuthState {
  isAuthenticated: boolean;
  user: AdminUser | null;
  loading: boolean;
  checkAuth: () => Promise<void>;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  loading: true,

  checkAuth: async () => {
    try {
      const response = await adminapi.get('/auth/me');
      if (response.data) {
        set({ isAuthenticated: true, user: response.data, loading: false });
      } else {
        set({ isAuthenticated: false, user: null, loading: false });
      }
    } catch (error) {
      set({ isAuthenticated: false, user: null, loading: false });
    }
  },

  login: async (phone: string, password: string) => {
    try {
      const response = await adminapi.post('/auth/login', { phone, password });
      const userData = response.data.user || response.data.organization;
      set({ isAuthenticated: true, user: userData });
      toast.success('Login Successful');
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Login failed';
      toast.error(msg);
      throw error;
    }
  },

  logout: async () => {
    try {
      await adminapi.post('/auth/logout');
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      set({ isAuthenticated: false, user: null });
    }
  },
}));
