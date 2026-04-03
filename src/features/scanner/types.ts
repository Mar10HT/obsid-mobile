export type QrPayloadType = 'LOAN_SEND' | 'LOAN_RETURN' | 'TRANSFER';

export interface QrPayload {
  type: QrPayloadType;
  id: string;
  code: string;
}

export interface ScanResponse {
  message: string;
  itemName?: string;
  warehouseName?: string;
}

export type ScanState =
  | { status: 'idle' }
  | { status: 'processing' }
  | { status: 'success'; payload: QrPayload; response: ScanResponse }
  | { status: 'error'; message: string };
