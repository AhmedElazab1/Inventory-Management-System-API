import z from 'zod';
import { createSaleSchema, salesQuerySchema, saleParamsSchema } from './sales.validation';
import { Prisma } from '../../../generated/client/client';

export type createSaleDTO = z.infer<typeof createSaleSchema>;

export type SaleResponseDTO = Prisma.SaleGetPayload<{
  include: {
    items: {
      include: {
        variant: {
          include: {
            product: true;
          };
        };
      };
    };
    cashier: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
  };
}>;

export type SaleQueryDTO = z.infer<typeof salesQuerySchema>;
export type SaleParamsDTO = z.infer<typeof saleParamsSchema>;
