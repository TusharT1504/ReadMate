import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';
import toast from 'react-hot-toast';

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
  favorites?: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User) => void;
  clearAuth: () => void;
  checkAuth: () => Promise<void>;
  toggleFavorite: (bookId?: string, bookDetails?: any) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
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

      toggleFavorite: async (bookId?: string, bookDetails?: any) => {
        const { user } = get();
        if (!user) return;

        const isFavorite = bookId && user.favorites?.includes(bookId);

        if (isFavorite) {
          // Optimistic remove
          const newFavorites = user.favorites?.filter(id => id !== bookId);
          set({ user: { ...user, favorites: newFavorites } });
          toast.success('Removed from favorites');
          try {
            await api.delete(`/users/me/favorites/${bookId}`);
          } catch (error) {
            set({ user }); // Revert
            toast.error('Failed to remove favorite');
            console.error('Failed to remove favorite', error);
          }
        } else {
          // Add
          // If we have bookId, optimistic add
          if (bookId) {
            const newFavorites = [...(user.favorites || []), bookId];
            set({ user: { ...user, favorites: newFavorites } });
          }
          
          toast.success('Added to favorites');
          try {
            const payload = bookId ? { bookId } : bookDetails;
            const res = await api.post('/users/me/favorites', payload);
            // Update with server state (which includes the new ID)
            set({ user: { ...user, favorites: res.data.data.favorites } });
          } catch (error) {
            if (bookId) set({ user }); // Revert
            toast.error('Failed to add favorite');
            console.error('Failed to add favorite', error);
          }
        }
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
