import { apiFetch } from '@features/auth/client';
import { API_ENDPOINTS } from '@constants/api';
import { WarehousesListResponseSchema } from './schemas';
import type { Warehouse } from './types';

export const warehousesApi = {
  getAll: (): Promise<Warehouse[]> =>
    apiFetch<unknown>(`${API_ENDPOINTS.warehouses}?limit=200`)
      .then(WarehousesListResponseSchema.parse)
      .then((res) => res.data),
};
