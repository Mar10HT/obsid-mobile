import { apiFetch } from '@features/auth/client';
import { API_ENDPOINTS } from '@constants/api';
import type { AlertsListResponse } from './types';

export const alertsApi = {
  getActive: (limit = 50): Promise<AlertsListResponse> =>
    apiFetch<AlertsListResponse>(`${API_ENDPOINTS.alerts}/active?limit=${limit}`),
};
