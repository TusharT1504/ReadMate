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
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User) => void;
  clearAuth: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false, // Start as false to avoid initial loading flash
      
      setAuth: (user) => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
        }
        set({ user, isAuthenticated: true, isLoading: false });
      },
      
      clearAuth: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
        }
        set({ user: null, isAuthenticated: false, isLoading: false });
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
          // Not authenticated or token expired - silently fail
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
          }
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      // Only persist the user object, not auth state flags
      partialize: (state) => ({ user: state.user }),
    }
  )
);
