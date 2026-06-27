import { create } from 'zustand';
import { api } from '@/lib/api';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  subscriptionStatus?: string;
  trialStartedAt?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  refreshAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  
  login: async (data: any) => {
    const response = await api.post('/api/auth/login', data);
    const { tokens, user } = response.data.data;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('xavier_access_token', tokens.accessToken);
      localStorage.setItem('xavier_refresh_token', tokens.refreshToken);
      document.cookie = `xavier_access_token=${tokens.accessToken}; path=/; max-age=604800`;
    }
    
    set({ user, isAuthenticated: true, isLoading: false });
  },
  
  logout: async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (e) {
      console.error('Logout API failed, proceeding with local logout');
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('xavier_access_token');
        localStorage.removeItem('xavier_refresh_token');
        document.cookie = 'xavier_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        window.location.href = '/login';
      }
      set({ user: null, isAuthenticated: false });
    }
  },
  
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  refreshAuth: async () => {
    set({ isLoading: true });
    try {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('xavier_access_token');
        if (token) {
          document.cookie = `xavier_access_token=${token}; path=/; max-age=604800`;
          const response = await api.get('/api/users/me');
          set({ user: response.data.data, isAuthenticated: true });
        } else {
          set({ user: null, isAuthenticated: false });
        }
      }
    } catch (error) {
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },
}));
