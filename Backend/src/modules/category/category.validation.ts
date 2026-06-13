import { z } from 'zod';

export const categoryParamsSchema = z.object({
  id: z.string().cuid('Invalid category ID'),
});

export const createCategorySchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(1).max(1000).optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const categoriesQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  sort: z.string().optional(),
  fields: z.string().optional(),
  search: z.string().optional(),
});
