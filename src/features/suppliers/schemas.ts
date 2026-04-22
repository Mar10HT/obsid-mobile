import { z } from 'zod';

export const SupplierSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const SuppliersListResponseSchema = z.object({
  data: z.array(SupplierSchema),
});
