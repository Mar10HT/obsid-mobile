import { z } from 'zod';

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const CategoriesListResponseSchema = z.object({
  data: z.array(CategorySchema),
});
