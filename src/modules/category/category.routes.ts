import express from 'express';
import { authenticate, authorize, validate } from '../../common/middlewares/index';
import { Role } from '../../../generated/client/enums';
import {
  getAllCategories,
  createCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from './category.controller';
import {
  categoryParamsSchema,
  updateCategorySchema,
  createCategorySchema,
  categoriesQuerySchema,
} from './category.validation';

const router = express.Router();

router.use(authenticate);

router.get('/', validate({ query: categoriesQuerySchema }), getAllCategories);
router.get('/:id', validate({ params: categoryParamsSchema }), getCategoryById);

router.use(authorize(Role.ADMIN));

router.post('/', validate({ body: createCategorySchema }), createCategory);
router.patch(
  '/:id',
  validate({ params: categoryParamsSchema, body: updateCategorySchema }),
  updateCategory,
);
router.delete('/:id', validate({ params: categoryParamsSchema }), deleteCategory);

export default router;
