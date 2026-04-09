import { z } from 'zod';

export const TransferItemSchema = z.object({
  id: z.string(),
  quantity: z.number(),
  inventoryItem: z.object({ id: z.string(), name: z.string() }),
});

export const TransferRequestSchema = z.object({
  id: z.string(),
  status: z.enum(['PENDING', 'APPROVED', 'SENT', 'RECEIVED', 'COMPLETED', 'REJECTED', 'CANCELLED']),
  sourceWarehouse: z.object({ id: z.string(), name: z.string() }),
  destinationWarehouse: z.object({ id: z.string(), name: z.string() }),
  requestedBy: z.object({ id: z.string(), name: z.string(), email: z.string() }),
  approvedBy: z.object({ id: z.string(), name: z.string(), email: z.string() }).optional(),
  items: z.array(TransferItemSchema),
  notes: z.string().optional(),
  sendQrCode: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const TransfersListResponseSchema = z.object({
  data: z.array(TransferRequestSchema),
  meta: z.object({ total: z.number(), page: z.number(), limit: z.number(), totalPages: z.number() }),
});

export const TransferRequestWithQrSchema = TransferRequestSchema.extend({
  qrCodeDataUrl: z.string(),
});

export const QrResponseSchema = z.object({
  qrCodeDataUrl: z.string(),
});
