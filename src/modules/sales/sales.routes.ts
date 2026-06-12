import express from 'express';
import { validate } from '../../common/middlewares/validation';
import { createSale, getSaleById, getAllSales } from './sales.controller';
import { salesQuerySchema, saleParamsSchema, createSaleSchema } from './sales.validation';

import { authenticate } from '../../common/middlewares';

const router = express.Router();

router.use(authenticate);

router.post('/', validate({ body: createSaleSchema }), createSale);
router.get('/:id', validate({ params: saleParamsSchema }), getSaleById);
router.get('/', validate({ query: salesQuerySchema }), getAllSales);

export default router;
