// Permission keys — mirrors Inv-App-API role permissions
export const PERMISSIONS = {
  // Inventory (granular, match backend @Permissions decorators)
  INVENTORY_VIEW: 'inventory:view',
  INVENTORY_CREATE: 'inventory:create',
  INVENTORY_EDIT: 'inventory:edit',
  INVENTORY_DELETE: 'inventory:delete',

  // Warehouses (backend uses singular "warehouse:...")
  WAREHOUSE_VIEW: 'warehouse:view',
  WAREHOUSE_MANAGE: 'warehouse:manage',

  // Categories
  CATEGORIES_VIEW: 'categories:view',

  // Suppliers
  SUPPLIERS_VIEW: 'suppliers:view',

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

  // Stock Take
  STOCKTAKE_VIEW: 'stocktake:view',
  STOCKTAKE_CREATE: 'stocktake:create',
  STOCKTAKE_MANAGE: 'stocktake:manage',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
