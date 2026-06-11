import prisma from '../../config/prisma';
import { paginate, parseQueryParams, PaginatedResult } from '../../common/utils/APIFeatures';
import ApiError from '../../common/utils/ApiError';
import { STATUS_CODE } from '../../common/constants/constants';
import {
  CreateProductDTO,
  UpdateProductDTO,
  ProductParamsDTO,
  ProductResponseDTO,
  ProductsQueryDTO,
} from './product.DTOs';
import { sanitizeProduct } from './product.mapper';
import { Prisma } from '../../../generated/client/client';

export const createProductService = async (data: CreateProductDTO): Promise<ProductResponseDTO> => {
  const { name, description, costPrice, sellingPrice, lowStockThreshold, categoryId, variants } =
    data;

  const categoryExists = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
  });

  if (!categoryExists) {
    throw new ApiError('Category not found', STATUS_CODE.NOT_FOUND);
  }

  const product = await prisma.product.create({
    data: {
      name,
      description,
      costPrice,
      sellingPrice,
      lowStockThreshold,
      categoryId,
      variants: {
        create: variants.map((variant) => ({
          size: variant.size,
          quantity: variant.quantity,
        })),
      },
    },
    include: {
      variants: true,
      category: true,
    },
  });
  return sanitizeProduct(product);
};

export const getAllProductsService = async (
  query: ProductsQueryDTO,
): Promise<PaginatedResult<ProductResponseDTO>> => {
  const parsedQuery = parseQueryParams(query);

  const { data, meta } = await paginate(prisma.product, parsedQuery, undefined, {
    variants: true,
    category: true,
  });

  // Since paginate infers T from model which lacks relation fields by default,
  // we cast data to the correct type including relations before sanitization.
  type ProductWithRelations = Prisma.ProductGetPayload<{
    include: { variants: true; category: true };
  }>;

  const sanitizedData = sanitizeProduct(data as ProductWithRelations[]);

  return { data: sanitizedData, meta };
};

export const getProductByIdService = async (
  params: ProductParamsDTO,
): Promise<ProductResponseDTO> => {
  const { id } = params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      variants: true,
      category: true,
    },
  });

  if (!product) {
    throw new ApiError('Product not found', STATUS_CODE.NOT_FOUND);
  }

  return sanitizeProduct(product);
};

export const updateProductService = async (
  params: ProductParamsDTO,
  data: UpdateProductDTO,
): Promise<ProductResponseDTO> => {
  const { id } = params;

  const productExists = await prisma.product.findUnique({
    where: { id },
  });

  if (!productExists) {
    throw new ApiError('Product not found', STATUS_CODE.NOT_FOUND);
  }

  if (data.categoryId) {
    const categoryExists = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!categoryExists) {
      throw new ApiError('Category not found', STATUS_CODE.NOT_FOUND);
    }
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      costPrice: data.costPrice,
      sellingPrice: data.sellingPrice,
      lowStockThreshold: data.lowStockThreshold,
      categoryId: data.categoryId,
    },
    include: {
      variants: true,
      category: true,
    },
  });

  return sanitizeProduct(product);
};

export const deleteProductService = async (params: ProductParamsDTO): Promise<void> => {
  const { id } = params;

  const productExists = await prisma.product.findUnique({
    where: { id },
  });

  if (!productExists) {
    throw new ApiError('Product not found', STATUS_CODE.NOT_FOUND);
  }

  const hasSales = await prisma.saleItem.count({
    where: { variant: { productId: id } },
  });
  if (hasSales > 0)
    throw new ApiError('Cannot delete product with sales history', STATUS_CODE.BAD_REQUEST);

  await prisma.productVariant.deleteMany({
    where: { productId: id },
  });

  await prisma.product.delete({
    where: { id },
  });
};
