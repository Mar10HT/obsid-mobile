import { apiFetch } from '@features/auth/client';
import { API_ENDPOINTS } from '@constants/api';
import type { AlertsListResponse } from './types';
import { AlertsListResponseSchema } from './schemas';

export const alertsApi = {
  getActive: (limit = 50): Promise<AlertsListResponse> =>
    apiFetch<unknown>(`${API_ENDPOINTS.alerts}/active?limit=${limit}`).then(AlertsListResponseSchema.parse),
};
