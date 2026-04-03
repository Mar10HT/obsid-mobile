export type TransferStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'SENT'
  | 'RECEIVED'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

export interface TransferItem {
  id: string;
  quantity: number;
  inventoryItem: { id: string; name: string };
}

export interface TransferRequest {
  id: string;
  status: TransferStatus;
  sourceWarehouse: { id: string; name: string };
  destinationWarehouse: { id: string; name: string };
  requestedBy: { id: string; name: string; email: string };
  approvedBy?: { id: string; name: string; email: string };
  items: TransferItem[];
  notes?: string;
  sendQrCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransfersListResponse {
  data: TransferRequest[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export type FilterTab = 'PENDING' | 'APPROVED' | 'SENT';
