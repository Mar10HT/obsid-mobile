import { jwtDecode } from 'jwt-decode';
import { API_BASE_URL, API_ENDPOINTS } from '@constants/api';
import { secureStore } from './secure-store';

// Shared refresh promise — prevents multiple concurrent refresh calls
let refreshPromise: Promise<string> | null = null;

// Callback to trigger logout when refresh fails — set by auth store
let onAuthFailure: (() => void) | null = null;

export function setAuthFailureCallback(cb: () => void): void {
  onAuthFailure = cb;
}

function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<{ exp: number }>(token);
    // Consider expired 30s early to avoid edge cases
    return decoded.exp * 1000 < Date.now() + 30_000;
  } catch {
    return true;
  }
}

async function doRefresh(): Promise<string> {
  const refreshToken = await secureStore.getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token');

  const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.refresh}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!res.ok) throw new Error('Refresh failed');

  const data = await res.json();
  await secureStore.setTokens(data.access_token, data.refresh_token);
  return data.access_token;
}

async function getValidToken(): Promise<string | null> {
  const token = await secureStore.getAccessToken();

  if (token && !isTokenExpired(token)) return token;

  // Share the same refresh promise across concurrent callers
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null;
    });
  }

  try {
    return await refreshPromise;
  } catch {
    await secureStore.clearTokens();
    onAuthFailure?.();
    return null;
  }
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getValidToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      message = body.message ?? message;
    } catch {
      // ignore parse errors
    }
    throw new ApiError(res.status, message);
  }

  // Handle empty responses (204 No Content)
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}
