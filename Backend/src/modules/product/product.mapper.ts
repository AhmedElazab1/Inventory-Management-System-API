import { Prisma } from '../../../generated/client/client';
import { ProductResponseDTO } from './product.DTOs';

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    variants: true;
    category: true;
  };
}>;

export function sanitizeProduct(product: ProductWithRelations): ProductResponseDTO;

export function sanitizeProduct(product: ProductWithRelations[]): ProductResponseDTO[];

export function sanitizeProduct(
  product: ProductWithRelations | ProductWithRelations[],
): ProductResponseDTO | ProductResponseDTO[] {
  if (Array.isArray(product)) {
    return product.map((p) => sanitizeProduct(p));
  }

  const totalQuantity = product.variants.reduce((sum, variant) => sum + variant.quantity, 0);
  const isLowStock = totalQuantity <= product.lowStockThreshold;

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    costPrice: product.costPrice,
    sellingPrice: product.sellingPrice,
    lowStockThreshold: product.lowStockThreshold,

    category: {
      id: product.category.id,
      name: product.category.name,
    },

    variants: product.variants.map((variant) => ({
      id: variant.id,
      size: variant.size,
      quantity: variant.quantity,
    })),

    totalQuantity,
    isLowStock,

    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}
