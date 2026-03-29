import { create } from 'zustand';
import { authApi, ApiRequestError, UserProfile } from '../lib/api-client';

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;

  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: UserProfile) => void;
  setError: (error: string | null) => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isHydrated: false,
  error: null,

  setHydrated: () => set({ isHydrated: true }),

  checkAuth: async () => {
    set({ isLoading: true, error: null });
    try {
      if (authApi.isLoggedIn()) {
        const user = await authApi.getMe();
        set({ user, isLoading: false, isHydrated: true });
      } else {
        set({ user: null, isLoading: false, isHydrated: true });
      }
    } catch (error) {
      if (error instanceof ApiRequestError && error.code === 'network_error') {
        set({ user: null, isLoading: false, isHydrated: true, error: null });
        return;
      }

      set({ user: null, isLoading: false, isHydrated: true, error: 'Session expired' });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authApi.logout();
    } finally {
      set({ user: null, isLoading: false });
    }
  },

  setUser: (user: UserProfile) => set({ user, error: null }),
  
  setError: (error: string | null) => set({ error }),
}));
