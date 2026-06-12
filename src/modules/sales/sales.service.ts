import prisma from '../../config/prisma';
import { createSaleDTO, SaleQueryDTO, SaleResponseDTO } from './sales.DTOs';
import { StockMovementType } from '../../../generated/client/enums';
import AppError from '../../common/utils/ApiError';
import { STATUS_CODE } from '../../common/constants/constants';
import { JwtPayload } from 'jsonwebtoken';
import { Prisma } from '../../../generated/client/client';
import { PaginatedResult, paginate, parseQueryParams } from '../../common/utils/APIFeatures';

type VariantWithProduct = Prisma.ProductVariantGetPayload<{
  include: { product: true };
}>;

export const createSaleService = async (
  data: createSaleDTO,
  user: JwtPayload,
): Promise<SaleResponseDTO> => {
  const { items } = data;

  const variantMap = new Map<string, VariantWithProduct>();

  for (const item of items) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: item.variantId },
      include: { product: true },
    });

    if (!variant) throw new AppError(`Variant not found: ${item.variantId}`, STATUS_CODE.NOT_FOUND);
    if (variant.quantity < item.quantity)
      throw new AppError('Insufficient stock', STATUS_CODE.BAD_REQUEST);

    variantMap.set(item.variantId, variant);
  }

  let totalAmount = 0;
  let totalCost = 0;

  for (const item of items) {
    const variant = variantMap.get(item.variantId)!;
    totalAmount += variant.product.sellingPrice * item.quantity;
    totalCost += variant.product.costPrice * item.quantity;
  }

  const result = await prisma.$transaction(async (tx) => {
    const sale = await tx.sale.create({
      data: {
        totalAmount,
        totalCost,
        cashierId: user.id,
        items: {
          create: items.map((item) => {
            const variant = variantMap.get(item.variantId)!;
            return {
              variantId: item.variantId,
              quantity: item.quantity,
              priceAtSale: variant.product.sellingPrice,
              costAtSale: variant.product.costPrice,
            };
          }),
        },
      },
      include: {
        items: { include: { variant: { include: { product: true } } } },
        cashier: true,
      },
    });

    for (const item of items) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { quantity: { decrement: item.quantity } },
      });

      await tx.stockMovement.create({
        data: {
          variantId: item.variantId,
          quantity: item.quantity,
          type: StockMovementType.OUT,
          reason: 'Sale',
        },
      });
    }

    return sale;
  });

  return result;
};

export const getSaleByIdService = async (id: string): Promise<SaleResponseDTO> => {
  const sale = await prisma.sale.findUnique({
    where: { id },
    include: {
      items: { include: { variant: { include: { product: true } } } },
      cashier: true,
    },
  });

  if (!sale) throw new AppError('Sale not found', STATUS_CODE.NOT_FOUND);

  return sale;
};

export const getAllSalesService = async (
  query: SaleQueryDTO,
): Promise<PaginatedResult<SaleResponseDTO>> => {
  const parsedQuery = parseQueryParams(query);
  const result = await paginate<SaleResponseDTO>(
    prisma.sale,
    parsedQuery,
    {},
    {
      items: { include: { variant: { include: { product: true } } } },
      cashier: true,
    },
  );

  return result;
};
