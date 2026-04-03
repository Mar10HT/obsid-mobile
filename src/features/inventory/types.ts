export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  minStock: number;
  warehouseId: string;
  warehouseName: string;
  categoryName?: string;
}

export interface InventoryStats {
  totalItems: number;
  lowStockCount: number;
  activeLoans: number;
  pendingTransfers: number;
}

// Raw shape returned by GET /api/inventory/stats
export interface RawInventoryStats {
  total: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  inUse: number;
  totalValue: number;
  categories: { name: string; count: number }[];
  locations: { name: string; count: number }[];
}

export interface Transaction {
  id: string;
  type: string;
  itemName: string;
  quantity: number;
  warehouseName: string;
  userName: string;
  createdAt: string;
}

// Raw shape returned by GET /api/transactions/recent
export interface RawTransaction {
  id: string;
  type: string;
  date: string;
  notes?: string;
  items: { inventoryItem: { name: string }; quantity: number }[];
  sourceWarehouse?: { name: string };
  destinationWarehouse?: { name: string };
  user?: { name?: string; email: string };
}
