import { apiFetch } from '@features/auth/client';
import { API_ENDPOINTS } from '@constants/api';
import type { InventoryItem, InventoryStats, Transaction } from './types';

export const inventoryApi = {
  getStats: (): Promise<InventoryStats> =>
    apiFetch<InventoryStats>(API_ENDPOINTS.inventoryStats),

  getItems: (params?: { search?: string; warehouseId?: string }): Promise<InventoryItem[]> => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.warehouseId) query.set('warehouseId', params.warehouseId);
    const qs = query.toString();
    return apiFetch<InventoryItem[]>(`${API_ENDPOINTS.inventory}${qs ? `?${qs}` : ''}`);
  },

  getRecentTransactions: (): Promise<Transaction[]> =>
    apiFetch<Transaction[]>(`${API_ENDPOINTS.transactions}?limit=5&sort=createdAt:desc`),
};
