import Constants from 'expo-constants';
import { env } from './env';

// In dev, extract the IP from Expo's hostUri (e.g. "192.168.1.45:8081") and
// append port 3001 so the phone reaches the local API without manual config.
function getApiBaseUrl(): string {
  if (__DEV__) {
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
      const ip = hostUri.split(':')[0];
      return `http://${ip}:3001`;
    }
  }
  // In dev/test fall back gracefully; in production the URL is required
  if (!env.EXPO_PUBLIC_API_URL) {
    if (typeof __DEV__ !== 'undefined' && !__DEV__) {
      throw new Error('[api] EXPO_PUBLIC_API_URL must be set in production builds.');
    }
    return 'http://localhost:3001';
  }
  return env.EXPO_PUBLIC_API_URL;
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

  // Categories
  categories: '/api/categories',

  // Suppliers
  suppliers: '/api/suppliers',

  // Transfers
  transfers: '/api/transfer-requests',
  transferScanQr: '/api/transfer-requests/scan-qr',

  // Loans
  loans: '/api/loans',
  loanScanQr: '/api/loans/scan-qr',

  // Transactions
  transactions: '/api/transactions',

  // Alerts
  alerts: '/api/alerts',

  // Stock Take
  stockTake: '/api/stock-take',

  // Auth extras
  changePassword: '/api/auth/change-password',
  pushToken: '/api/users/push-token',
} as const;
