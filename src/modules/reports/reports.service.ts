import prisma from '../../config/prisma';

export const getReportSummaryService = async () => {
  const result = await prisma.sale.aggregate({
    _sum: { totalAmount: true, totalCost: true },
    _count: { id: true },
  });

  return {
    totalSales: result._count.id,
    totalRevenue: result._sum.totalAmount,
    totalCost: result._sum.totalCost,
    totalProfit: (result._sum.totalAmount || 0) - (result._sum.totalCost || 0),
  };
};

export const getTopProductsReportService = async () => {
  const result = await prisma.saleItem.groupBy({
    by: ['variantId'],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 10,
  });

  const variantIds = result.map((r) => r.variantId);

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: { product: { select: { name: true } } },
  });

  return result.map((r) => ({
    ...r,
    variant: variants.find((v) => v.id === r.variantId),
  }));
};

export const getLowStockReportService = async () => {
  const variants = await prisma.productVariant.findMany({
    include: { product: true },
    orderBy: { quantity: 'asc' },
  });

  return variants.filter((v) => v.quantity <= v.product.lowStockThreshold);
};

export const getCashierReportService = async () => {
  const result = await prisma.sale.groupBy({
    by: ['cashierId'],
    _sum: { totalAmount: true },
    _count: { id: true },
  });

  const cashierIds = result.map((r) => r.cashierId);
  const cashiers = await prisma.user.findMany({
    where: { id: { in: cashierIds } },
    select: { id: true, name: true, email: true },
  });

  return result.map((r) => ({
    ...r,
    cashier: cashiers.find((c) => c.id === r.cashierId),
  }));
};
