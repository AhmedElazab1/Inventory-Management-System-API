import { catchAsync } from '../../common/utils/catchAsync';
import { Request, Response } from 'express';
import logger from '../../common/utils/logger';
import { STATUS_CODE, STATUS } from '../../common/constants/constants';
import { createSaleService, getSaleByIdService, getAllSalesService } from './sales.service';
import { JwtPayload } from 'jsonwebtoken';
import { SaleParamsDTO, SaleQueryDTO } from './sales.DTOs';

export const createSale = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const data = req.body;
  const user = req.user;
  const sale = await createSaleService(data, user as JwtPayload);

  logger.info('Sale created successfully', { saleId: sale.id });

  res.status(STATUS_CODE.CREATED).json({
    status: STATUS.SUCCESS,
    message: 'Sale created successfully',
    data: sale,
  });
});

export const getSaleById = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as SaleParamsDTO;
  const sale = await getSaleByIdService(id);

  logger.info('Sale fetched successfully', { saleId: sale.id });

  res.status(STATUS_CODE.SUCCESS).json({
    status: STATUS.SUCCESS,
    message: 'Sale fetched successfully',
    data: sale,
  });
});

export const getAllSales = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const query = req.query as SaleQueryDTO;
  const sales = await getAllSalesService(query);

  logger.info('Sales fetched successfully');

  res.status(STATUS_CODE.SUCCESS).json({
    status: STATUS.SUCCESS,
    message: 'Sales fetched successfully',
    data: sales,
  });
});
