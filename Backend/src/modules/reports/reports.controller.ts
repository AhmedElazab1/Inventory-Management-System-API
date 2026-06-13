import { catchAsync } from '../../common/utils/catchAsync';
import { Request, Response } from 'express';
import logger from '../../common/utils/logger';
import { STATUS_CODE, STATUS } from '../../common/constants/constants';
import {
  getReportSummaryService,
  getTopProductsReportService,
  getLowStockReportService,
  getCashierReportService,
} from './reports.service';

export const getReportSummary = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const summary = await getReportSummaryService();
  res.status(STATUS_CODE.SUCCESS).json({
    status: STATUS.SUCCESS,
    message: 'Report summary fetched successfully',
    data: summary,
  });
});

export const getTopProductsReport = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const report = await getTopProductsReportService();
    res.status(STATUS_CODE.SUCCESS).json({
      status: STATUS.SUCCESS,
      message: 'Top products report fetched successfully',
      data: report,
    });
  },
);

export const getLowStockReport = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const report = await getLowStockReportService();
  res.status(STATUS_CODE.SUCCESS).json({
    status: STATUS.SUCCESS,
    message: 'Low stock report fetched successfully',
    data: report,
  });
});

export const getCashierReport = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const report = await getCashierReportService();
  res.status(STATUS_CODE.SUCCESS).json({
    status: STATUS.SUCCESS,
    message: 'Cashier report fetched successfully',
    data: report,
  });
});
