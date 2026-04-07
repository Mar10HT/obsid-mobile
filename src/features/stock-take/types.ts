export type StockTakeStatus = 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface StockTakeItem {
  id: string;
  itemId: string;
  expectedQty: number;
  countedQty: number | null;
  variance: number | null;
  notes: string | null;
  countedAt: string | null;
  item: {
    id: string;
    name: string;
    sku: string;
  };
}

export interface StockTake {
  id: string;
  status: StockTakeStatus;
  notes: string | null;
  createdAt: string;
  completedAt: string | null;
  warehouse: { id: string; name: string };
  startedBy: { id: string; name: string | null; email: string };
  completedBy: { id: string; name: string | null; email: string } | null;
  items: StockTakeItem[];
  _count?: { items: number };
}

export interface StockTakeListItem extends Omit<StockTake, 'items'> {
  _count: { items: number };
}

export interface StockTakesListResponse {
  data: StockTakeListItem[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}
