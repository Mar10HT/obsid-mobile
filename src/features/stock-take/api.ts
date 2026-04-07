import { apiFetch } from '@features/auth/client';
import { API_ENDPOINTS } from '@constants/api';
import type { StockTake, StockTakeItem, StockTakesListResponse } from './types';

export const stockTakeApi = {
  getList: (status?: string): Promise<StockTakesListResponse> => {
    const qs = status ? `?status=${status}&limit=20` : '?limit=20';
    return apiFetch<StockTakesListResponse>(`${API_ENDPOINTS.stockTake}${qs}`);
  },

  getOne: (id: string): Promise<StockTake> =>
    apiFetch<StockTake>(`${API_ENDPOINTS.stockTake}/${id}`),

  create: (warehouseId: string, notes?: string): Promise<StockTake> =>
    apiFetch<StockTake>(API_ENDPOINTS.stockTake, {
      method: 'POST',
      body: JSON.stringify({ warehouseId, notes }),
    }),

  updateItem: (
    stockTakeId: string,
    itemId: string,
    countedQty: number,
    notes?: string,
  ): Promise<StockTakeItem> =>
    apiFetch<StockTakeItem>(`${API_ENDPOINTS.stockTake}/${stockTakeId}/items`, {
      method: 'PATCH',
      body: JSON.stringify({ itemId, countedQty, notes }),
    }),

  complete: (id: string, applyChanges: boolean): Promise<StockTake> =>
    apiFetch<StockTake>(
      `${API_ENDPOINTS.stockTake}/${id}/complete?applyChanges=${applyChanges}`,
      { method: 'PATCH' },
    ),

  cancel: (id: string): Promise<StockTake> =>
    apiFetch<StockTake>(`${API_ENDPOINTS.stockTake}/${id}/cancel`, { method: 'PATCH' }),
};
