import { API_BASE_URL, API_ENDPOINTS } from '@constants/api';
import { apiFetch } from './client';
import { secureStore } from './secure-store';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  permissionsVersion: number;
  warehouseId?: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthUser> => {
    // Login is CSRF-exempt on the API: mobile clients call this before having
    // a Bearer token and React Native fetch cannot access HttpOnly cookies.
    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.login}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message ?? 'Credenciales incorrectas');
    }

    const data: AuthTokens & { user: object } = await res.json();
    await secureStore.setTokens(data.access_token, data.refresh_token);
    // Fetch full user profile including permissions (login response omits them)
    return authApi.getMe();
  },

  getMe: async (): Promise<AuthUser> => {
    const res = await apiFetch<{
      user: { id: string; email: string; name: string; role: string };
      permissions: string[];
      permissionsVersion: number;
    }>(API_ENDPOINTS.me);
    return { ...res.user, permissions: res.permissions, permissionsVersion: res.permissionsVersion };
  },

  changePassword: (currentPassword: string, newPassword: string): Promise<void> =>
    apiFetch(API_ENDPOINTS.changePassword, {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  // Sends refresh_token in body — backend needs to support this for mobile
  logout: async (): Promise<void> => {
    const refreshToken = await secureStore.getRefreshToken();
    try {
      await apiFetch(API_ENDPOINTS.logout, {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    } catch {
      // Best-effort — clear local tokens regardless
    } finally {
      await secureStore.clearTokens();
    }
  },
};
