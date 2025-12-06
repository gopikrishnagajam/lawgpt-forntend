import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, LoginResponse, SessionContext } from '../types/api.types';
import { authService } from '../services/auth.service';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  sessionContext: SessionContext | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setAuth: (data: LoginResponse) => void;
  clearAuth: () => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      sessionContext: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (data: LoginResponse) => {
        // Store tokens in localStorage for axios interceptor
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);

        set({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          sessionContext: data.context,
          isAuthenticated: true,
        });
      },

      clearAuth: () => {
        // Clear tokens from localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          sessionContext: null,
          isAuthenticated: false,
        });
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          get().clearAuth();
        }
      },

      refreshUser: async () => {
        try {
          set({ isLoading: true });
          const user = await authService.getMe();
          set({ user, isLoading: false });
        } catch (error) {
          console.error('Failed to refresh user:', error);
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        sessionContext: state.sessionContext,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
