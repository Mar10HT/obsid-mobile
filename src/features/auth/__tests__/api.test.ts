import { authApi } from '../api';
import { secureStore } from '../secure-store';

// Mock expo-secure-store transitively used by secureStore
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock the secureStore wrapper so tests control token state directly
jest.mock('../secure-store', () => ({
  secureStore: {
    getAccessToken: jest.fn(),
    getRefreshToken: jest.fn(),
    setTokens: jest.fn(),
    clearTokens: jest.fn(),
  },
}));

// Mock the apiFetch client so tests do not hit real HTTP
jest.mock('../client', () => ({
  apiFetch: jest.fn(),
  setAuthFailureCallback: jest.fn(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ApiError: class MockApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
    }
  },
}));

// Import after mocks so the module picks up the mock implementations
import { apiFetch } from '../client';

const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;
const mockSecureStore = secureStore as jest.Mocked<typeof secureStore>;

const MOCK_USER = {
  id: 'user-1',
  email: 'mario@test.com',
  name: 'Mario',
  role: 'ADMIN',
  permissions: ['inventory:read', 'inventory:write'],
  permissionsVersion: 3,
  warehouseId: 'wh-1',
};

describe('authApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const credentials = { email: 'mario@test.com', password: 'secret' };

    it('stores tokens and returns user profile on success', async () => {
      const mockFetch = jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'access-abc',
          refresh_token: 'refresh-xyz',
          user: {},
        }),
      } as Response);

      mockSecureStore.setTokens.mockResolvedValue();
      mockApiFetch.mockResolvedValueOnce({
        user: { id: MOCK_USER.id, email: MOCK_USER.email, name: MOCK_USER.name, role: MOCK_USER.role },
        permissions: MOCK_USER.permissions,
        permissionsVersion: MOCK_USER.permissionsVersion,
      });

      const result = await authApi.login(credentials);

      expect(mockSecureStore.setTokens).toHaveBeenCalledWith('access-abc', 'refresh-xyz');
      expect(result.email).toBe(MOCK_USER.email);
      expect(result.permissions).toEqual(MOCK_USER.permissions);

      mockFetch.mockRestore();
    });

    it('throws when the server returns a non-ok response', async () => {
      const mockFetch = jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Credenciales incorrectas' }),
      } as Response);

      await expect(authApi.login(credentials)).rejects.toThrow('Credenciales incorrectas');

      mockFetch.mockRestore();
    });

    it('throws when the response is missing tokens', async () => {
      const mockFetch = jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: {} }),
      } as Response);

      await expect(authApi.login(credentials)).rejects.toThrow('Respuesta de servidor inválida');

      mockFetch.mockRestore();
    });
  });

  describe('getMe', () => {
    it('maps the API response to AuthUser shape', async () => {
      mockApiFetch.mockResolvedValueOnce({
        user: { id: MOCK_USER.id, email: MOCK_USER.email, name: MOCK_USER.name, role: MOCK_USER.role },
        permissions: MOCK_USER.permissions,
        permissionsVersion: MOCK_USER.permissionsVersion,
      });

      const user = await authApi.getMe();

      expect(user.id).toBe(MOCK_USER.id);
      expect(user.permissions).toEqual(MOCK_USER.permissions);
      expect(user.permissionsVersion).toBe(MOCK_USER.permissionsVersion);
    });
  });

  describe('logout', () => {
    it('sends refresh token and clears stored tokens', async () => {
      mockSecureStore.getRefreshToken.mockResolvedValue('refresh-xyz');
      mockApiFetch.mockResolvedValueOnce(undefined);
      mockSecureStore.clearTokens.mockResolvedValue();

      await authApi.logout();

      expect(mockApiFetch).toHaveBeenCalledWith(
        expect.stringContaining('logout'),
        expect.objectContaining({ method: 'POST' }),
      );
      expect(mockSecureStore.clearTokens).toHaveBeenCalled();
    });

    it('clears tokens even when the API call fails', async () => {
      mockSecureStore.getRefreshToken.mockResolvedValue('refresh-xyz');
      mockApiFetch.mockRejectedValueOnce(new Error('Network error'));
      mockSecureStore.clearTokens.mockResolvedValue();

      await authApi.logout();

      expect(mockSecureStore.clearTokens).toHaveBeenCalled();
    });
  });
});
