import { catchAsync } from '../../common/utils/catchAsync';
import { Request, Response } from 'express';
import logger from '../../common/utils/logger';
import { STATUS_CODE, STATUS } from '../../common/constants/constants';
import { 
  createProductService, 
  getAllProductsService,
  getProductByIdService,
  updateProductService,
  deleteProductService
} from './product.service';
import { ProductParamsDTO } from './product.DTOs';

export const createProduct = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const data = req.body;
  const product = await createProductService(data);

  logger.info('Product created successfully', { productId: product.id });

  res.status(STATUS_CODE.CREATED).json({
    status: STATUS.SUCCESS,
    message: 'Product created successfully',
    data: product,
  });
});

export const getAllProducts = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const query = req.query;
  const products = await getAllProductsService(query);

  logger.info('Products fetched successfully', { count: products.meta?.total });

  res.status(STATUS_CODE.SUCCESS).json({
    status: STATUS.SUCCESS,
    message: 'Products fetched successfully',
    ...products,
  });
});

export const getProduct = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const product = await getProductByIdService({ id } as ProductParamsDTO);

  logger.info('Product fetched successfully', { productId: product.id });

  res.status(STATUS_CODE.SUCCESS).json({
    status: STATUS.SUCCESS,
    message: 'Product fetched successfully',
    data: product,
  });
});

export const updateProduct = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const data = req.body;
  const product = await updateProductService({ id } as ProductParamsDTO, data);

  logger.info('Product updated successfully', { productId: product.id });

  res.status(STATUS_CODE.SUCCESS).json({
    status: STATUS.SUCCESS,
    message: 'Product updated successfully',
    data: product,
  });
});

export const deleteProduct = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  await deleteProductService({ id } as ProductParamsDTO);

  logger.info('Product deleted successfully', { productId: id });

  res.status(STATUS_CODE.SUCCESS).json({
    status: STATUS.SUCCESS,
    message: 'Product deleted successfully',
  });
});
