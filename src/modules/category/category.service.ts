import prisma from '../../config/prisma';
import { paginate, parseQueryParams, PaginatedResult } from '../../common/utils/APIFeatures';
import ApiError from '../../common/utils/ApiError';
import { STATUS_CODE } from '../../common/constants/constants';
import {
  CategoriesQueryDTO,
  CreateCategoryDTO,
  UpdateCategoryDTO,
  CategoryParamsDTO,
  CategoryResponseDTO,
} from './category.DTOs';

export const createCategoryService = async (
  data: CreateCategoryDTO,
): Promise<CategoryResponseDTO> => {
  const { name, description } = data;

  const nameExists = await prisma.category.findUnique({
    where: { name },
  });

  if (nameExists) {
    throw new ApiError('Category name already exists', STATUS_CODE.CONFLICT);
  }

  const category = await prisma.category.create({
    data: {
      name,
      description,
    },
  });

  return category;
};

export const getAllCategoriesService = async (
  query: CategoriesQueryDTO,
): Promise<PaginatedResult<CategoryResponseDTO>> => {
  const parsedQuery = parseQueryParams(query);
  const result = await paginate(prisma.category, parsedQuery);

  return result;
};

export const getCategoryByIdService = async (
  params: CategoryParamsDTO,
): Promise<CategoryResponseDTO> => {
  const { id } = params;

  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    throw new ApiError('Category not found', STATUS_CODE.NOT_FOUND);
  }

  return category;
};

export const updateCategoryService = async (
  params: CategoryParamsDTO,
  data: UpdateCategoryDTO,
): Promise<CategoryResponseDTO> => {
  const { id } = params;
  const { name, description } = data;

  const category = await prisma.category.findUnique({
    where: { id },
  });
  if (!category) {
    throw new ApiError('Category not found', STATUS_CODE.NOT_FOUND);
  }

  if (data.name) {
    const nameExists = await prisma.category.findFirst({
      where: { name: data.name, NOT: { id } },
    });
    if (nameExists) {
      throw new ApiError('Category name already exists', STATUS_CODE.CONFLICT);
    }
  }

  const updatedCategory = await prisma.category.update({
    where: { id },
    data: {
      name,
      description,
    },
  });

  return updatedCategory;
};

export const deleteCategoryService = async (params: CategoryParamsDTO) => {
  const { id } = params;

  const category = await prisma.category.findUnique({
    where: { id },
  });
  if (!category) {
    throw new ApiError('Category not found', STATUS_CODE.NOT_FOUND);
  }

  const productsCount = await prisma.product.count({
    where: { categoryId: id },
  });

  if (productsCount > 0) {
    throw new ApiError('Cannot delete category with existing products', STATUS_CODE.BAD_REQUEST);
  }

  await prisma.category.delete({
    where: { id },
  });

  return;
};
