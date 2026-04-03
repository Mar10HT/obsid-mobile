import { apiFetch } from '@features/auth/client';
import { API_ENDPOINTS } from '@constants/api';
import type { TransferRequest, TransfersListResponse, TransferStatus } from './types';

export const transfersApi = {
  getList: (status?: TransferStatus): Promise<TransfersListResponse> => {
    const qs = status ? `?status=${status}` : '';
    return apiFetch<TransfersListResponse>(`${API_ENDPOINTS.transfers}${qs}`);
  },

  approve: (id: string): Promise<TransferRequest> =>
    apiFetch<TransferRequest>(`${API_ENDPOINTS.transfers}/${id}/approve`, { method: 'PATCH' }),

  reject: (id: string, reason: string): Promise<TransferRequest> =>
    apiFetch<TransferRequest>(`${API_ENDPOINTS.transfers}/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    }),

  send: (id: string): Promise<TransferRequest & { qrCodeDataUrl: string }> =>
    apiFetch<TransferRequest & { qrCodeDataUrl: string }>(
      `${API_ENDPOINTS.transfers}/${id}/send`,
      { method: 'PATCH' },
    ),

  getQr: (id: string): Promise<{ qrCodeDataUrl: string }> =>
    apiFetch<{ qrCodeDataUrl: string }>(`${API_ENDPOINTS.transfers}/${id}/qr`),
};
