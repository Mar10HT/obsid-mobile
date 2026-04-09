import { z } from 'zod';

export const StockTakeItemSchema = z.object({
  id: z.string(),
  itemId: z.string(),
  expectedQty: z.number(),
  countedQty: z.number().nullable(),
  variance: z.number().nullable(),
  notes: z.string().nullable(),
  countedAt: z.string().nullable(),
  item: z.object({ id: z.string(), name: z.string(), sku: z.string() }),
});

const UserRefSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string(),
});

export const StockTakeSchema = z.object({
  id: z.string(),
  status: z.enum(['IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  notes: z.string().nullable(),
  createdAt: z.string(),
  completedAt: z.string().nullable(),
  warehouse: z.object({ id: z.string(), name: z.string() }),
  startedBy: UserRefSchema,
  completedBy: UserRefSchema.nullable(),
  items: z.array(StockTakeItemSchema),
  _count: z.object({ items: z.number() }).optional(),
});

// List items omit the full items array but include _count
export const StockTakeListItemSchema = StockTakeSchema.omit({ items: true }).extend({
  _count: z.object({ items: z.number() }),
});

export const StockTakesListResponseSchema = z.object({
  data: z.array(StockTakeListItemSchema),
  meta: z.object({ total: z.number(), page: z.number(), limit: z.number(), totalPages: z.number() }),
});
