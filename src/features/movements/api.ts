import { apiFetch } from '@features/auth/client';
import { API_ENDPOINTS } from '@constants/api';
import type { Warehouse, CreateMovementDto } from './types';

export const movementsApi = {
  getWarehouses: (): Promise<Warehouse[]> =>
    apiFetch<{ data: Warehouse[] }>(`${API_ENDPOINTS.warehouses}?limit=200`)
      .then((res) => res.data),

  create: (dto: CreateMovementDto): Promise<unknown> =>
    apiFetch(API_ENDPOINTS.transactions, {
      method: 'POST',
      body: JSON.stringify(dto),
    }),
};
