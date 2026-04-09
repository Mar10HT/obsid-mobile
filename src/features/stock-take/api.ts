import { apiFetch } from '@features/auth/client';
import { API_ENDPOINTS } from '@constants/api';
import type { StockTake, StockTakeItem, StockTakesListResponse } from './types';
import { StockTakeItemSchema, StockTakeSchema, StockTakesListResponseSchema } from './schemas';

export const stockTakeApi = {
  getList: (status?: string): Promise<StockTakesListResponse> => {
    const qs = status ? `?status=${status}&limit=20` : '?limit=20';
    return apiFetch<unknown>(`${API_ENDPOINTS.stockTake}${qs}`).then(StockTakesListResponseSchema.parse);
  },

  getOne: (id: string): Promise<StockTake> =>
    apiFetch<unknown>(`${API_ENDPOINTS.stockTake}/${id}`).then(StockTakeSchema.parse),

  create: (warehouseId: string, notes?: string): Promise<StockTake> =>
    apiFetch<unknown>(API_ENDPOINTS.stockTake, {
      method: 'POST',
      body: JSON.stringify({ warehouseId, notes }),
    }).then(StockTakeSchema.parse),

  updateItem: (
    stockTakeId: string,
    itemId: string,
    countedQty: number,
    notes?: string,
  ): Promise<StockTakeItem> =>
    apiFetch<unknown>(`${API_ENDPOINTS.stockTake}/${stockTakeId}/items`, {
      method: 'PATCH',
      body: JSON.stringify({ itemId, countedQty, notes }),
    }).then(StockTakeItemSchema.parse),

  complete: (id: string, applyChanges: boolean): Promise<StockTake> =>
    apiFetch<unknown>(
      `${API_ENDPOINTS.stockTake}/${id}/complete?applyChanges=${applyChanges}`,
      { method: 'PATCH' },
    ).then(StockTakeSchema.parse),

  cancel: (id: string): Promise<StockTake> =>
    apiFetch<unknown>(`${API_ENDPOINTS.stockTake}/${id}/cancel`, { method: 'PATCH' }).then(StockTakeSchema.parse),
};
