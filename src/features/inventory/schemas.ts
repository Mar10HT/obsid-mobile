import { z } from 'zod';

export const InventoryItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  sku: z.string(),
  quantity: z.number(),
  minStock: z.number(),
  warehouseId: z.string(),
  warehouseName: z.string(),
  categoryName: z.string().optional(),
  expiryDate: z.string().nullable().optional(),
});

export const PaginationMetaSchema = z.object({
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const InventoryItemsListSchema = z.object({
  data: z.array(InventoryItemSchema),
  meta: PaginationMetaSchema.optional(),
});

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
  inventoryItem: z.object({ name: z.string() }).nullable().optional(),
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

export const RawTransactionListSchema = z.object({
  data: z.array(RawTransactionSchema),
  meta: PaginationMetaSchema,
});

export type RawInventoryStats = z.infer<typeof RawInventoryStatsSchema>;
export type RawTransaction = z.infer<typeof RawTransactionSchema>;
export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;
