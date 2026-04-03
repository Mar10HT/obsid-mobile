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

export interface Transaction {
  id: string;
  type: 'ENTRADA' | 'SALIDA' | 'TRANSFERENCIA' | 'PRESTAMO' | 'DEVOLUCION';
  itemName: string;
  quantity: number;
  warehouseName: string;
  userName: string;
  createdAt: string;
}
