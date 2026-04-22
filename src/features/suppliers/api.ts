import { apiFetch } from '@features/auth/client';
import { API_ENDPOINTS } from '@constants/api';
import { SuppliersListResponseSchema } from './schemas';
import type { Supplier } from './types';

export const suppliersApi = {
  getAll: (): Promise<Supplier[]> =>
    apiFetch<unknown>(`${API_ENDPOINTS.suppliers}?limit=200`)
      .then(SuppliersListResponseSchema.parse)
      .then((res) => res.data),
};
