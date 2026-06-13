import { StockMovementType } from '../../../generated/client/enums';
import prisma from '../../config/prisma';
import { createStockMovementDTO, adjustmentDTO, stockMovementResponseDTO } from './inventory.DTOs';
import AppError from '../../common/utils/ApiError';
import { STATUS_CODE } from '../../common/constants/constants';

export const stockInService = async (
  body: createStockMovementDTO,
): Promise<stockMovementResponseDTO> => {
  const { variantId, quantity, reason } = body;

  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
  });

  if (!variant) {
    throw new AppError(`Variant with id ${variantId} not found`, STATUS_CODE.NOT_FOUND);
  }

  const result = await prisma.$transaction([
    prisma.productVariant.update({
      where: { id: variantId },
      data: {
        quantity: { increment: quantity },
      },
    }),
    prisma.stockMovement.create({
      data: {
        variantId,
        quantity,
        reason,
        type: StockMovementType.IN,
      },
    }),
  ]);

  return result[1];
};

export const stockOutService = async (
  body: createStockMovementDTO,
): Promise<stockMovementResponseDTO> => {
  const { variantId, quantity, reason } = body;

  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
  });

  if (!variant) {
    throw new AppError(`Variant with id ${variantId} not found`, STATUS_CODE.NOT_FOUND);
  }

  if (variant.quantity < quantity) {
    throw new AppError(`Not enough stock for variant ${variantId}`, STATUS_CODE.BAD_REQUEST);
  }

  const result = await prisma.$transaction([
    prisma.productVariant.update({
      where: { id: variantId },
      data: {
        quantity: { decrement: quantity },
      },
    }),
    prisma.stockMovement.create({
      data: {
        variantId,
        quantity,
        reason,
        type: StockMovementType.OUT,
      },
    }),
  ]);

  return result[1];
};

export const adjustStockService = async (
  body: adjustmentDTO,
): Promise<stockMovementResponseDTO> => {
  const { variantId, newQuantity, reason } = body;

  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
  });

  if (!variant) {
    throw new AppError(`Variant with id ${variantId} not found`, STATUS_CODE.NOT_FOUND);
  }

  const result = await prisma.$transaction([
    prisma.productVariant.update({
      where: { id: variantId },
      data: {
        quantity: newQuantity,
      },
    }),
    prisma.stockMovement.create({
      data: {
        variantId,
        quantity: Math.abs(newQuantity - variant.quantity),
        reason,
        type: StockMovementType.ADJUSTMENT,
      },
    }),
  ]);

  return result[1];
};

export const getStockMovementHistoryService = async (
  variantId: string,
): Promise<stockMovementResponseDTO[]> => {
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
  });

  if (!variant) {
    throw new AppError(`Variant with id ${variantId} not found`, STATUS_CODE.NOT_FOUND);
  }

  const movements = await prisma.stockMovement.findMany({
    where: { variantId },
  });

  return movements;
};
