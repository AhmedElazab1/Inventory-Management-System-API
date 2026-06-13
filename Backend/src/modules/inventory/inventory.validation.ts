import z from 'zod';

export const stockMovementSchema = z.object({
  variantId: z.string().cuid(),
  quantity: z.number().int().positive(),
  reason: z.string().optional(),
});

export const adjustmentSchema = z.object({
  variantId: z.string().cuid(),
  newQuantity: z.number().int().nonnegative(),
  reason: z.string().optional(),
});

export const variantIdSchema = z.object({
  variantId: z.string().cuid(),
});
