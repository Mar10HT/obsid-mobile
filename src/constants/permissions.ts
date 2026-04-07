// Permission keys — mirrors Inv-App-API role permissions
export const PERMISSIONS = {
  // Inventory
  INVENTORY_VIEW: 'inventory:view',
  INVENTORY_MANAGE: 'inventory:manage',

  // Warehouses
  WAREHOUSES_VIEW: 'warehouses:view',
  WAREHOUSES_MANAGE: 'warehouses:manage',

  // Transfers
  TRANSFERS_CREATE: 'transfers:create',
  TRANSFERS_MANAGE: 'transfers:manage',

  // Loans
  LOANS_CREATE: 'loans:create',
  LOANS_MANAGE: 'loans:manage',

  // Transactions
  TRANSACTIONS_CREATE: 'transactions:create',
  TRANSACTIONS_VIEW: 'transactions:view',

  // Reports
  REPORTS_VIEW: 'reports:view',

  // Alerts
  ALERTS_VIEW: 'alerts:view',
  ALERTS_MANAGE: 'alerts:manage',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
