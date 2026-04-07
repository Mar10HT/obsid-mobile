export type AlertType = 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRING_SOON';

export interface Alert {
  id: string;
  type: AlertType;
  currentQty: number;
  threshold: number;
  resolvedAt: string | null;
  notified: boolean;
  createdAt: string;
  item: {
    id: string;
    name: string;
    sku: string;
    warehouse: {
      id: string;
      name: string;
    };
  };
}

export interface AlertsListResponse {
  data: Alert[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
