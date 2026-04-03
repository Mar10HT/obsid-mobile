import { apiFetch } from '@features/auth/client';
import { API_ENDPOINTS } from '@constants/api';
import type { Warehouse, CreateMovementDto } from './types';

export const movementsApi = {
  getWarehouses: (): Promise<Warehouse[]> =>
    apiFetch<Warehouse[]>(API_ENDPOINTS.warehouses),

  create: (dto: CreateMovementDto): Promise<unknown> =>
    apiFetch(API_ENDPOINTS.transactions, {
      method: 'POST',
      body: JSON.stringify(dto),
    }),
};
