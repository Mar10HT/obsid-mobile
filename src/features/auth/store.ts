import { create } from 'zustand';
import { setAuthFailureCallback } from './client';
import { authApi, type AuthUser } from './api';
import { secureStore } from './secure-store';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredSession: () => Promise<void>;
  refreshPermissions: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Register the auth failure callback so the client can trigger logout
  setAuthFailureCallback(() => {
    set({ user: null, isAuthenticated: false });
  });

  return {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,

    login: async (email, password) => {
      set({ isLoading: true, error: null });
      try {
        const user = await authApi.login({ email, password });
        set({ user, isAuthenticated: true, isLoading: false });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al iniciar sesión';
        set({ error: message, isLoading: false });
        throw err;
      }
    },

    logout: async () => {
      set({ isLoading: true });
      await authApi.logout();
      set({ user: null, isAuthenticated: false, isLoading: false });
    },

    loadStoredSession: async () => {
      set({ isLoading: true });
      try {
        const token = await secureStore.getAccessToken();
        if (!token) {
          set({ isLoading: false });
          return;
        }
        const user = await authApi.getMe();
        set({ user, isAuthenticated: true, isLoading: false });
      } catch {
        await secureStore.clearTokens();
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    },

    refreshPermissions: async () => {
      try {
        const user = await authApi.getMe();
        const current = get().user;
        if (current && user.permissionsVersion !== current.permissionsVersion) {
          set({ user });
        }
      } catch {
        // Silent — permission refresh is best-effort
      }
    },

    clearError: () => set({ error: null }),
  };
});

// Selector helpers
export const useUser = () => useAuthStore((s) => s.user);
export const useIsAuthenticated = () => useAuthStore((s) => s.isAuthenticated);
export const usePermissions = () => useAuthStore((s) => s.user?.permissions ?? []);
