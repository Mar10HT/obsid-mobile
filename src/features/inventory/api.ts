import { apiFetch } from '@features/auth/client';
import { API_ENDPOINTS } from '@constants/api';
import {
  CreateInventoryInputSchema,
  InventoryItemDetailSchema,
  InventoryItemsListSchema,
  RawInventoryStatsSchema,
  RawTransactionSchema,
  UpdateInventoryInputSchema,
} from './schemas';
import type {
  CreateInventoryInput,
  InventoryItemDetail,
  UpdateInventoryInput,
} from './schemas';
import type { InventoryItem, InventoryStats, Transaction } from './types';

// Maps transaction type names from the API to dashboard display keys
const TX_TYPE_MAP: Record<string, string> = {
  IN:       'ENTRADA',
  OUT:      'SALIDA',
  TRANSFER: 'TRANSFERENCIA',
  LOAN:     'PRESTAMO',
  RETURN:   'DEVOLUCION',
};

export const inventoryApi = {
  getStats: (): Promise<InventoryStats> =>
    apiFetch<unknown>(API_ENDPOINTS.inventoryStats).then((data) => {
      const raw = RawInventoryStatsSchema.parse(data);
      return {
        totalItems: raw.total,
        lowStockCount: raw.lowStock,
        activeLoans: raw.inUse,
        // TODO: replace with a dedicated /api/transfer-requests/stats?status=PENDING endpoint.
        // outOfStock is NOT a valid proxy for pending transfers — omit the metric until real data is available.
        pendingTransfers: undefined,
      };
    }),

  getItems: (params?: { search?: string; warehouseId?: string }): Promise<{ data: InventoryItem[] }> => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.warehouseId) query.set('warehouseId', params.warehouseId);
    const qs = query.toString();
    return apiFetch<unknown>(`${API_ENDPOINTS.inventory}${qs ? `?${qs}` : ''}`).then(InventoryItemsListSchema.parse);
  },

  getById: (id: string): Promise<InventoryItemDetail> =>
    apiFetch<unknown>(`${API_ENDPOINTS.inventory}/${id}`).then(InventoryItemDetailSchema.parse),

  create: async (input: CreateInventoryInput): Promise<InventoryItemDetail> => {
    const validated = CreateInventoryInputSchema.parse(input);
    const data = await apiFetch<unknown>(API_ENDPOINTS.inventory, {
      method: 'POST',
      body: JSON.stringify(validated),
    });
    return InventoryItemDetailSchema.parse(data);
  },

  update: async (id: string, input: UpdateInventoryInput): Promise<InventoryItemDetail> => {
    const validated = UpdateInventoryInputSchema.parse(input);
    const data = await apiFetch<unknown>(`${API_ENDPOINTS.inventory}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(validated),
    });
    return InventoryItemDetailSchema.parse(data);
  },

  remove: (id: string): Promise<void> =>
    apiFetch<void>(`${API_ENDPOINTS.inventory}/${id}`, { method: 'DELETE' }),

  getRecentTransactions: (): Promise<Transaction[]> =>
    apiFetch<unknown>(`${API_ENDPOINTS.transactions}/recent?limit=5`).then((data) => {
      const rows = RawTransactionSchema.array().parse(data);
      return rows.map((tx) => ({
        id: tx.id,
        type: TX_TYPE_MAP[tx.type] ?? tx.type,
        itemName: tx.items[0]?.inventoryItem?.name ?? '—',
        quantity: tx.items.reduce((sum, i) => sum + i.quantity, 0),
        warehouseName: tx.sourceWarehouse?.name ?? tx.destinationWarehouse?.name ?? '—',
        userName: tx.user?.name ?? tx.user?.email ?? '—',
        createdAt: tx.date,
      }));
    }),
};
