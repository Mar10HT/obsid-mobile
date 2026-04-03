import { apiFetch } from '@features/auth/client';
import { API_ENDPOINTS } from '@constants/api';
import type { Loan, LoansListResponse, LoanStatus } from './types';

export const loansApi = {
  getList: (status?: LoanStatus): Promise<LoansListResponse> => {
    const qs = status ? `?status=${status}` : '';
    return apiFetch<LoansListResponse>(`${API_ENDPOINTS.loans}${qs}`);
  },

  getActive: (): Promise<LoansListResponse> =>
    apiFetch<LoansListResponse>(`${API_ENDPOINTS.loans}/active`),

  send: (id: string): Promise<Loan & { qrCodeDataUrl: string }> =>
    apiFetch<Loan & { qrCodeDataUrl: string }>(`${API_ENDPOINTS.loans}/${id}/send`, {
      method: 'PATCH',
    }),

  getQr: (id: string, type: 'send' | 'return'): Promise<{ qrDataUrl: string }> =>
    apiFetch<{ qrDataUrl: string }>(`${API_ENDPOINTS.loans}/${id}/qr/${type}`),

  initiateReturn: (id: string): Promise<Loan & { qrCodeDataUrl: string }> =>
    apiFetch<Loan & { qrCodeDataUrl: string }>(`${API_ENDPOINTS.loans}/${id}/initiate-return`, {
      method: 'PATCH',
    }),

  cancel: (id: string): Promise<Loan> =>
    apiFetch<Loan>(`${API_ENDPOINTS.loans}/${id}/cancel`, { method: 'PATCH' }),
};
