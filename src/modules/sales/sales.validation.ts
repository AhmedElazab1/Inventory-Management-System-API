import z from 'zod';

export const createSaleSchema = z.object({
  items: z
    .array(
      z.object({
        variantId: z.string().cuid(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
});

export const salesQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  sort: z.string().optional(),
  fields: z.string().optional(),
  search: z.string().optional(),
});

export const saleParamsSchema = z.object({
  id: z.string().cuid({ message: 'Invalid sale ID' }),
});
