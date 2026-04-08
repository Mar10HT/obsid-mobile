import { z } from 'zod';

export const RawInventoryStatsSchema = z.object({
  total: z.number(),
  inStock: z.number(),
  lowStock: z.number(),
  outOfStock: z.number(),
  inUse: z.number(),
  totalValue: z.number(),
  categories: z.array(z.object({ name: z.string(), count: z.number() })),
  locations: z.array(z.object({ name: z.string(), count: z.number() })),
});

export const RawTransactionItemSchema = z.object({
  inventoryItem: z.object({ name: z.string() }),
  quantity: z.number(),
});

export const RawTransactionSchema = z.object({
  id: z.string(),
  type: z.string(),
  date: z.string(),
  notes: z.string().optional(),
  items: z.array(RawTransactionItemSchema),
  sourceWarehouse: z.object({ name: z.string() }).optional(),
  destinationWarehouse: z.object({ name: z.string() }).optional(),
  user: z.object({ name: z.string().optional(), email: z.string() }).optional(),
});

export const RawTransactionListSchema = z.array(RawTransactionSchema);

export type RawInventoryStats = z.infer<typeof RawInventoryStatsSchema>;
export type RawTransaction = z.infer<typeof RawTransactionSchema>;
