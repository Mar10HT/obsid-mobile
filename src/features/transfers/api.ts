import { apiFetch } from '@features/auth/client';
import { API_ENDPOINTS } from '@constants/api';
import type { TransferRequest, TransfersListResponse, TransferStatus } from './types';
import {
  QrResponseSchema,
  TransferRequestSchema,
  TransferRequestWithQrSchema,
  TransfersListResponseSchema,
} from './schemas';

export const transfersApi = {
  getList: (status?: TransferStatus): Promise<TransfersListResponse> => {
    const qs = status ? `?status=${status}` : '';
    return apiFetch<unknown>(`${API_ENDPOINTS.transfers}${qs}`).then(TransfersListResponseSchema.parse);
  },

  approve: (id: string): Promise<TransferRequest> =>
    apiFetch<unknown>(`${API_ENDPOINTS.transfers}/${id}/approve`, { method: 'PATCH' }).then(TransferRequestSchema.parse),

  reject: (id: string, reason: string): Promise<TransferRequest> =>
    apiFetch<unknown>(`${API_ENDPOINTS.transfers}/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    }).then(TransferRequestSchema.parse),

  send: (id: string): Promise<TransferRequest & { qrCodeDataUrl: string }> =>
    apiFetch<unknown>(
      `${API_ENDPOINTS.transfers}/${id}/send`,
      { method: 'PATCH' },
    ).then(TransferRequestWithQrSchema.parse),

  getQr: (id: string): Promise<{ qrCodeDataUrl: string }> =>
    apiFetch<unknown>(`${API_ENDPOINTS.transfers}/${id}/qr`).then(QrResponseSchema.parse),
};
