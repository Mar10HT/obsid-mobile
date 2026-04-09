// Raw API shapes are now defined as Zod schemas — import types from there
export type { RawInventoryStats, RawTransaction } from './schemas';

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
  // Optional: only populated when a dedicated stats endpoint is available.
  pendingTransfers?: number;
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
