import z from 'zod';
import {
  categoryParamsSchema,
  createCategorySchema,
  updateCategorySchema,
  categoriesQuerySchema,
} from './category.validation';

export type CategoryParamsDTO = z.infer<typeof categoryParamsSchema>;
export type CreateCategoryDTO = z.infer<typeof createCategorySchema>;
export type UpdateCategoryDTO = z.infer<typeof updateCategorySchema>;
export type CategoriesQueryDTO = z.infer<typeof categoriesQuerySchema>;
export type CategoryResponseDTO = {
  id: string;
  name: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
};
