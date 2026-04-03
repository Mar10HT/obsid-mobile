// API base URL — override with environment variable in production
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

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
