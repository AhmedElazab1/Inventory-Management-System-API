import express from 'express';
import { authenticate, authorize } from '../../common/middlewares';
import { Role } from '../../../generated/client/enums';
import {
  getReportSummary,
  getTopProductsReport,
  getLowStockReport,
  getCashierReport,
} from './reports.controller';

const router = express.Router();

router.use(authenticate, authorize(Role.ADMIN));

router.get('/summary', getReportSummary);
router.get('/top-products', getTopProductsReport);
router.get('/low-stock', getLowStockReport);
router.get('/cashier', getCashierReport);

export default router;
