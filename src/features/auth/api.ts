import { API_BASE_URL, API_ENDPOINTS } from '@constants/api';
import { apiFetch } from './client';
import { secureStore } from './secure-store';
import { AuthTokensSchema, GetMeResponseSchema } from './schemas';

export type { AuthUser } from './schemas';

export interface LoginCredentials {
  email: string;
  password: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    // Login is CSRF-exempt on the API: mobile clients call this before having
    // a Bearer token and React Native fetch cannot access HttpOnly cookies.
    const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.login}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as Record<string, unknown>;
      throw new Error(typeof body.message === 'string' ? body.message : 'Credenciales incorrectas');
    }

    const raw: unknown = await res.json();
    // Validate token shape at the API boundary
    const { access_token, refresh_token } = AuthTokensSchema.parse(raw);
    await secureStore.setTokens(access_token, refresh_token);
    // Fetch full user profile including permissions (login response omits them)
    return authApi.getMe();
  },

  getMe: async () => {
    const raw = await apiFetch<unknown>(API_ENDPOINTS.me);
    const res = GetMeResponseSchema.parse(raw);
    return { ...res.user, permissions: res.permissions, permissionsVersion: res.permissionsVersion };
  },

  // Backend returns 204 No Content; treat any 2xx as success
  changePassword: (currentPassword: string, newPassword: string): Promise<void> =>
    apiFetch<void>(API_ENDPOINTS.changePassword, {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }).then(() => undefined), // normalize any response to void

  // Passing null clears the stored token — backend accepts `{ token: null }` to unregister
  clearPushToken: (): Promise<void> =>
    apiFetch(API_ENDPOINTS.pushToken, {
      method: 'PATCH',
      body: JSON.stringify({ token: null }),
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
