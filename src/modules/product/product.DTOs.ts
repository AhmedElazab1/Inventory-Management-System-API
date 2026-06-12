import { z } from 'zod';
import {
  createProductSchema,
  updateProductSchema,
  productParamsSchema,
  productsQuerySchema,
} from './product.validation';

export type CreateProductDTO = z.infer<typeof createProductSchema>;
export type UpdateProductDTO = z.infer<typeof updateProductSchema>;
export type ProductParamsDTO = z.infer<typeof productParamsSchema>;
export type ProductsQueryDTO = z.infer<typeof productsQuerySchema>;
export type ProductResponseDTO = {
  id: string;
  name: string;
  description?: string | null;
  costPrice: number;
  sellingPrice: number;
  lowStockThreshold: number;
  category: {
    id: string;
    name: string;
  };
  variants: ProductVariantResponseDTO[];
  totalQuantity: number;
  isLowStock: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductVariantResponseDTO = {
  id: string;
  size: string;
  quantity: number;
};
