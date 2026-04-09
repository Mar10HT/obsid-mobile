import { z } from 'zod';

export const WarehouseSchema = z.object({
  id: z.string(),
  name: z.string(),
  location: z.string().optional(),
});

export const WarehousesListResponseSchema = z.object({
  data: z.array(WarehouseSchema),
});
