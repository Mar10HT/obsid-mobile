import * as SecureStore from 'expo-secure-store';

const KEYS = {
  ACCESS_TOKEN: 'obsid_access_token',
  REFRESH_TOKEN: 'obsid_refresh_token',
} as const;

export const secureStore = {
  getAccessToken: (): Promise<string | null> =>
    SecureStore.getItemAsync(KEYS.ACCESS_TOKEN),

  getRefreshToken: (): Promise<string | null> =>
    SecureStore.getItemAsync(KEYS.REFRESH_TOKEN),

  setTokens: async (accessToken: string, refreshToken: string): Promise<void> => {
    await Promise.all([
      SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, accessToken),
      SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, refreshToken),
    ]);
  },

  clearTokens: async (): Promise<void> => {
    await Promise.all([
      SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN),
      SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN),
    ]);
  },
};
