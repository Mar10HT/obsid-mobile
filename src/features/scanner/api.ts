import { apiFetch } from '@features/auth/client';
import { API_ENDPOINTS } from '@constants/api';
import type { QrPayload, ScanResponse } from './types';

export const scannerApi = {
  scanTransfer: (payload: QrPayload): Promise<ScanResponse> =>
    apiFetch<ScanResponse>(API_ENDPOINTS.transferScanQr, {
      method: 'POST',
      body: JSON.stringify({ payload: JSON.stringify(payload) }),
    }),

  scanLoan: (payload: QrPayload): Promise<ScanResponse> =>
    apiFetch<ScanResponse>(API_ENDPOINTS.loanScanQr, {
      method: 'POST',
      body: JSON.stringify({ payload: JSON.stringify(payload) }),
    }),
};
