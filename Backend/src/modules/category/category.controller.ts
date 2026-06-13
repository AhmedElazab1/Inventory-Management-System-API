import { catchAsync } from '../../common/utils/catchAsync';
import { NextFunction, Request, Response } from 'express';
import logger from '../../common/utils/logger';
import { STATUS_CODE, STATUS } from '../../common/constants/constants';
import {
  createCategoryService,
  getAllCategoriesService,
  getCategoryByIdService,
  updateCategoryService,
  deleteCategoryService,
} from './category.service';
import { CategoryParamsDTO } from './category.DTOs';

export const createCategory = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const data = req.body;
  const category = await createCategoryService(data);

  logger.info('Category created successfully');

  res.status(STATUS_CODE.CREATED).json({
    status: STATUS.SUCCESS,
    message: 'Category created successfully',
    data: category,
  });
});

export const getAllCategories = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const query = req.query;
  const categories = await getAllCategoriesService(query);

  logger.info('Categories fetched successfully', { count: categories.meta?.total });

  res.status(STATUS_CODE.SUCCESS).json({
    status: STATUS.SUCCESS,
    message: 'Categories fetched successfully',
    ...categories,
  });
});

export const getCategoryById = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const category = await getCategoryByIdService({ id } as CategoryParamsDTO);

  logger.info('Category fetched successfully', { categoryId: category.id });

  res.status(STATUS_CODE.SUCCESS).json({
    status: STATUS.SUCCESS,
    message: 'Category fetched successfully',
    data: category,
  });
});

export const updateCategory = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const data = req.body;
  const category = await updateCategoryService({ id } as CategoryParamsDTO, data);

  logger.info('Category updated successfully', { categoryId: category.id });

  res.status(STATUS_CODE.SUCCESS).json({
    status: STATUS.SUCCESS,
    message: 'Category updated successfully',
    data: category,
  });
});

export const deleteCategory = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  await deleteCategoryService({ id } as CategoryParamsDTO);

  logger.info('Category deleted successfully', { categoryId: id });

  res.status(STATUS_CODE.SUCCESS).json({
    status: STATUS.SUCCESS,
    message: 'Category deleted successfully',
  });
});
