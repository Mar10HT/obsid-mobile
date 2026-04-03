export type LoanStatus =
  | 'PENDING'
  | 'SENT'
  | 'RECEIVED'
  | 'RETURN_PENDING'
  | 'RETURNED'
  | 'OVERDUE'
  | 'CANCELLED';

export interface Loan {
  id: string;
  status: LoanStatus;
  quantity: number;
  loanDate: string;
  dueDate: string;
  returnDate?: string;
  notes?: string;
  sendQrCode?: string;
  returnQrCode?: string;
  inventoryItem: { id: string; name: string; serviceTag?: string };
  sourceWarehouse: { id: string; name: string };
  destinationWarehouse: { id: string; name: string };
  createdBy: { id: string; name: string };
}

export interface LoansListResponse {
  data: Loan[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export type LoanFilterTab = 'PENDING' | 'ACTIVE' | 'RETURN_PENDING';
