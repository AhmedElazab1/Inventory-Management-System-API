import { catchAsync } from '../../common/utils/catchAsync';
import { Request, Response } from 'express';
import logger from '../../common/utils/logger';
import {
  stockInService,
  stockOutService,
  adjustStockService,
  getStockMovementHistoryService,
} from './inventory.service';

export const stockIn = catchAsync(async (req: Request, res: Response) => {
  const body = req.body;
  const data = await stockInService(body);

  logger.info('Stock movement recorded', { data });

  return res.status(200).json({
    message: 'Stock movement recorded successfully',
    data,
  });
});

export const stockOut = catchAsync(async (req: Request, res: Response) => {
  const body = req.body;
  const data = await stockOutService(body);

  logger.info('Stock movement recorded', { data });

  return res.status(200).json({
    message: 'Stock movement recorded successfully',
    data,
  });
});

export const adjustStock = catchAsync(async (req: Request, res: Response) => {
  const body = req.body;
  const data = await adjustStockService(body);

  logger.info('Stock adjusted', { data });

  return res.status(200).json({
    message: 'Stock adjusted successfully',
    data,
  });
});

export const getStockMovementHistory = catchAsync(async (req: Request, res: Response) => {
  const { variantId } = req.params;
  const data = await getStockMovementHistoryService(variantId as string);

  logger.info('Stock movement history retrieved', { data });

  return res.status(200).json({
    message: 'Stock movement history retrieved successfully',
    data,
  });
});
