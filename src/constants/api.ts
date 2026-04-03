import Constants from 'expo-constants';

// In dev, extract the IP from Expo's hostUri (e.g. "192.168.1.45:8081") and
// append port 3000 so the phone reaches the local API without manual config.
function getApiBaseUrl(): string {
  if (__DEV__) {
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
      const ip = hostUri.split(':')[0];
      return `http://${ip}:3000`;
    }
  }
  return process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';
}

export const API_BASE_URL = getApiBaseUrl();

export const API_ENDPOINTS = {
  // Auth
  login: '/api/auth/login',
  logout: '/api/auth/logout',
  refresh: '/api/auth/refresh',
  me: '/api/auth/me',

  // Inventory
  inventory: '/api/inventory',
  inventoryStats: '/api/inventory/stats',
  inventoryLowStock: '/api/inventory/low-stock',

  // Warehouses
  warehouses: '/api/warehouses',

  // Transfers
  transfers: '/api/transfer-requests',
  transferScanQr: '/api/transfer-requests/scan-qr',

  // Loans
  loans: '/api/loans',
  loanScanQr: '/api/loans/scan-qr',

  // Transactions
  transactions: '/api/transactions',
} as const;
