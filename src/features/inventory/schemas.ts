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

// Detailed item shape returned by GET /api/inventory/:id and by create/update responses.
// More permissive than the list schema to accommodate backend fields that may be
// added over time without breaking the mobile client.
export const InventoryItemDetailSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  sku: z.string().nullable().optional(),
  barcode: z.string().nullable().optional(),
  quantity: z.number(),
  minQuantity: z.number().nullable().optional(),
  price: z.number().nullable().optional(),
  currency: z.string().nullable().optional(),
  warehouseId: z.string(),
  warehouse: z.object({ id: z.string(), name: z.string() }).nullable().optional(),
  categoryId: z.string().nullable().optional(),
  category: z.object({ id: z.string(), name: z.string() }).nullable().optional(),
  supplierId: z.string().nullable().optional(),
  supplier: z.object({ id: z.string(), name: z.string() }).nullable().optional(),
  itemType: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  model: z.string().nullable().optional(),
  serviceTag: z.string().nullable().optional(),
  serialNumber: z.string().nullable().optional(),
  expirationDate: z.string().nullable().optional(),
});

// Input schema for POST /api/inventory. MVP mirrors the backend DTO but only
// exposes BULK-compatible fields. UNIQUE-specific fields (serviceTag, serialNumber,
// assignedToUserId) are intentionally omitted until the UNIQUE flow is built.
export const CreateInventoryInputSchema = z.object({
  name: z.string().min(3).max(255),
  quantity: z.number().int().min(0),
  category: z.string().min(1),
  warehouseId: z.string().min(1),
  description: z.string().max(1000).optional(),
  sku: z.string().max(100).optional(),
  barcode: z.string().max(100).optional(),
  supplierId: z.string().optional(),
  minQuantity: z.number().int().min(0).optional(),
  price: z.number().min(0).optional(),
  currency: z.string().optional(),
  expirationDate: z.string().optional(),
});

// Update is a partial of Create; PATCH semantics on the backend.
export const UpdateInventoryInputSchema = CreateInventoryInputSchema.partial();

export type InventoryItemDetail = z.infer<typeof InventoryItemDetailSchema>;
export type CreateInventoryInput = z.infer<typeof CreateInventoryInputSchema>;
export type UpdateInventoryInput = z.infer<typeof UpdateInventoryInputSchema>;
export type RawInventoryStats = z.infer<typeof RawInventoryStatsSchema>;
export type RawTransaction = z.infer<typeof RawTransactionSchema>;
export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;
