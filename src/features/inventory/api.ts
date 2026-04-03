import { apiFetch } from '@features/auth/client';
import { API_ENDPOINTS } from '@constants/api';
import type { InventoryItem, InventoryStats, Transaction, RawInventoryStats, RawTransaction } from './types';

// Maps Spanish transaction type names used in the API to dashboard display keys
const TX_TYPE_MAP: Record<string, string> = {
  IN:       'ENTRADA',
  OUT:      'SALIDA',
  TRANSFER: 'TRANSFERENCIA',
  LOAN:     'PRESTAMO',
  RETURN:   'DEVOLUCION',
};

export const inventoryApi = {
  getStats: (): Promise<InventoryStats> =>
    apiFetch<RawInventoryStats>(API_ENDPOINTS.inventoryStats).then((raw) => ({
      totalItems: raw.total,
      lowStockCount: raw.lowStock,
      activeLoans: raw.inUse,
      pendingTransfers: raw.outOfStock, // best available proxy; replace if a dedicated endpoint is added
    })),

  getItems: (params?: { search?: string; warehouseId?: string }): Promise<{ data: InventoryItem[] }> => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.warehouseId) query.set('warehouseId', params.warehouseId);
    const qs = query.toString();
    // API returns paginated { data: [], meta: {} }
    return apiFetch<{ data: InventoryItem[] }>(`${API_ENDPOINTS.inventory}${qs ? `?${qs}` : ''}`);
  },

  getRecentTransactions: (): Promise<Transaction[]> =>
    apiFetch<RawTransaction[]>(`${API_ENDPOINTS.transactions}/recent?limit=5`).then((rows) =>
      rows.map((tx) => ({
        id: tx.id,
        type: TX_TYPE_MAP[tx.type] ?? tx.type,
        itemName: tx.items[0]?.inventoryItem?.name ?? '—',
        quantity: tx.items.reduce((sum, i) => sum + i.quantity, 0),
        warehouseName: tx.sourceWarehouse?.name ?? tx.destinationWarehouse?.name ?? '—',
        userName: tx.user?.name ?? tx.user?.email ?? '—',
        createdAt: tx.date,
      }))
    ),
};
