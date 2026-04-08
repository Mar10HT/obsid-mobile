import { apiFetch } from '@features/auth/client';
import { API_ENDPOINTS } from '@constants/api';
import { LoanSchema, LoansListResponseSchema } from './schemas';
import type { Loan, LoansListResponse, LoanStatus } from './types';
import { z } from 'zod';

const LoanWithQrSchema = LoanSchema.extend({ qrCodeDataUrl: z.string() });

export const loansApi = {
  getList: (status?: LoanStatus): Promise<LoansListResponse> => {
    const qs = status ? `?status=${status}` : '';
    return apiFetch<unknown>(`${API_ENDPOINTS.loans}${qs}`).then(LoansListResponseSchema.parse);
  },

  getActive: (): Promise<LoansListResponse> =>
    apiFetch<unknown>(`${API_ENDPOINTS.loans}/active`).then(LoansListResponseSchema.parse),

  send: (id: string): Promise<Loan & { qrCodeDataUrl: string }> =>
    apiFetch<unknown>(`${API_ENDPOINTS.loans}/${id}/send`, { method: 'PATCH' }).then(LoanWithQrSchema.parse),

  getQr: (id: string, type: 'send' | 'return'): Promise<{ qrDataUrl: string }> =>
    apiFetch<{ qrDataUrl: string }>(`${API_ENDPOINTS.loans}/${id}/qr/${type}`),

  initiateReturn: (id: string): Promise<Loan & { qrCodeDataUrl: string }> =>
    apiFetch<unknown>(`${API_ENDPOINTS.loans}/${id}/initiate-return`, { method: 'PATCH' }).then(LoanWithQrSchema.parse),

  cancel: (id: string): Promise<Loan> =>
    apiFetch<unknown>(`${API_ENDPOINTS.loans}/${id}/cancel`, { method: 'PATCH' }).then(LoanSchema.parse),
};
