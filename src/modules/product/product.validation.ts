import z from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long'),
  description: z.string().optional(),
  costPrice: z.number().positive('Cost price must be positive'),
  sellingPrice: z.number().positive('Selling price must be positive'),
  lowStockThreshold: z
    .number()
    .int()
    .positive('Low stock threshold must be a positive integer')
    .default(5),
  categoryId: z.string().cuid('Invalid category ID'),
  variants: z
    .array(
      z.object({
        size: z.string(),
        quantity: z
          .number()
          .int()
          .nonnegative('Quantity must be a non-negative integer')
          .default(0),
      }),
    )
    .min(1, 'Product must have at least one variant')
    .refine(
      (variants) => {
        const sizes = variants.map((v) => v.size);
        return new Set(sizes).size === sizes.length;
      },
      {
        message: 'Variant sizes must be unique',
      },
    ),
});

export const updateProductSchema = createProductSchema.omit({ variants: true }).partial();

export const productParamsSchema = z.object({
  id: z.string().cuid({ message: 'Invalid product ID' }),
});

export const productsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  sort: z.string().optional(),
  fields: z.string().optional(),
  search: z.string().optional(),
});
