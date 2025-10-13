import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

interface User {
  _id: string;
  email: string;
  name: string;
  dob?: string;
  age?: number;
  gender?: string;
  preferences?: {
    favoriteGenres: string[];
    dislikedGenres: string[];
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token?: string, refreshToken?: string) => void;
  clearAuth: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,
      
      setAuth: (user, token, refreshToken) => {
        // Tokens are now in HTTP-only cookies, but keep fallback for compatibility
        if (token && typeof window !== 'undefined') {
          localStorage.setItem('token', token);
        }
        if (refreshToken && typeof window !== 'undefined') {
          localStorage.setItem('refreshToken', refreshToken);
        }
        set({ user, token, refreshToken, isAuthenticated: true, isLoading: false });
      },
      
      clearAuth: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
        }
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false, isLoading: false });
      },
      
      // Check if user is authenticated (via cookies)
      checkAuth: async () => {
        try {
          set({ isLoading: true });
          // This will automatically send cookies with the request
          const response = await api.get('/auth/me');
          const user = response.data.data.user;
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          // Not authenticated or token expired
          set({ user: null, isAuthenticated: false, isLoading: false });
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
          }
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
