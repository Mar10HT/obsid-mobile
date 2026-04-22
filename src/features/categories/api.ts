import { apiFetch } from '@features/auth/client';
import { API_ENDPOINTS } from '@constants/api';
import { CategoriesListResponseSchema } from './schemas';
import type { Category } from './types';

export const categoriesApi = {
  getAll: (): Promise<Category[]> =>
    apiFetch<unknown>(`${API_ENDPOINTS.categories}?limit=200`)
      .then(CategoriesListResponseSchema.parse)
      .then((res) => res.data),
};
