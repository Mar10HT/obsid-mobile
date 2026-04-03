export type TransactionType = 'IN' | 'OUT';

export interface Warehouse {
  id: string;
  name: string;
  location?: string;
}

export interface MovementItem {
  inventoryItemId: string;
  name: string;
  quantity: number;
}

export interface CreateMovementDto {
  type: TransactionType;
  sourceWarehouseId?: string;
  destinationWarehouseId?: string;
  date: string;
  notes?: string;
  items: { inventoryItemId: string; quantity: number }[];
}
