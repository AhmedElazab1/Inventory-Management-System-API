import express from 'express';
import { authorize, authenticate } from '../../common/middlewares';
import { validate } from '../../common/middlewares';
import { stockMovementSchema, adjustmentSchema, variantIdSchema } from './inventory.validation';
import { Role } from '../../../generated/client/enums';
import { stockIn, stockOut, adjustStock, getStockMovementHistory } from './inventory.controller';

const router = express.Router();

router.use(authenticate, authorize(Role.ADMIN));

router.post('/stock-in', validate({ body: stockMovementSchema }), stockIn);
router.post('/stock-out', validate({ body: stockMovementSchema }), stockOut);
router.post('/adjust', validate({ body: adjustmentSchema }), adjustStock);
router.get('/:variantId/history', validate({ params: variantIdSchema }), getStockMovementHistory);

export default router;
