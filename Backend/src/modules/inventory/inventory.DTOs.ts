import z from 'zod';
import { stockMovementSchema, adjustmentSchema, variantIdSchema } from './inventory.validation';

export type createStockMovementDTO = z.infer<typeof stockMovementSchema>;
export type adjustmentDTO = z.infer<typeof adjustmentSchema>;
export type stockMovementResponseDTO = {
  variantId: string;
  quantity: number;
  reason: string | null;
  type: string;
  createdAt: Date;
};

export type variantIdDTO = z.infer<typeof variantIdSchema>;
