import { z } from 'zod';

export const AlertSchema = z.object({
  id: z.string(),
  type: z.enum(['LOW_STOCK', 'OUT_OF_STOCK', 'EXPIRING_SOON']),
  currentQty: z.number(),
  threshold: z.number(),
  resolvedAt: z.string().nullable(),
  notified: z.boolean(),
  createdAt: z.string(),
  item: z.object({
    id: z.string(),
    name: z.string(),
    sku: z.string(),
    warehouse: z.object({ id: z.string(), name: z.string() }),
  }),
});

export const AlertsListResponseSchema = z.object({
  data: z.array(AlertSchema),
  meta: z.object({ total: z.number(), page: z.number(), limit: z.number(), totalPages: z.number() }),
});
