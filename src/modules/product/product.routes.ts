import express from 'express';
import {
  createProduct,
  deleteProduct,
  getProduct,
  getAllProducts,
  updateProduct,
} from './product.controller';
import { authenticate, authorize, validate } from '../../common/middlewares';
import { Role } from '../../../generated/client/enums';
import {
  createProductSchema,
  updateProductSchema,
  productParamsSchema,
  productsQuerySchema,
} from './product.validation';

const router = express.Router();

router.use(authenticate);

router.get('/', validate({ query: productsQuerySchema }), getAllProducts);
router.get('/:id', validate({ params: productParamsSchema }), getProduct);

router.use(authorize(Role.ADMIN));

router.post('/', validate({ body: createProductSchema }), createProduct);
router.patch('/:id', validate({ body: updateProductSchema }), updateProduct);
router.delete('/:id', validate({ params: productParamsSchema }), deleteProduct);

export default router;
