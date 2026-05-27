import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  subscriptionStatus?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (user, accessToken, refreshToken) => {
        Cookies.set('accessToken', accessToken, { secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
        Cookies.set('refreshToken', refreshToken, { secure: process.env.NODE_ENV === 'production', sameSite: 'strict', expires: 7 });
        set({ user, isAuthenticated: true });
      },

      logout: () => {
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        set({ user: null, isAuthenticated: false });
      },

      updateUser: (updatedData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedData } : null,
        }));
      },
    }),
    {
      name: 'auth-storage', // persists to localStorage by default
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }), // Only persist these
    }
  )
);
