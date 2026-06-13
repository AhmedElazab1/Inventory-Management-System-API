export type Role = "ADMIN" | "CASHIER";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProductVariant = {
  id: string;
  size: string;
  quantity: number;
};

export type Product = {
  id: string;
  name: string;
  description?: string | null;
  costPrice: number;
  sellingPrice: number;
  lowStockThreshold: number;
  totalQuantity: number;
  isLowStock: boolean;
  category: { id: string; name: string };
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
};

export type SaleItem = {
  id: string;
  quantity: number;
  priceAtSale: number;
  costAtSale: number;
  variant: {
    id: string;
    size: string;
    product: { name: string };
  };
};

export type Sale = {
  id: string;
  totalAmount: number;
  totalCost: number;
  cashier: { id: string; name: string; email: string };
  items: SaleItem[];
  createdAt: string;
};

export type StockMovement = {
  id: string;
  type: "IN" | "OUT" | "ADJUSTMENT";
  quantity: number;
  reason?: string | null;
  createdAt: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type ApiResponse<T> = {
  status: string;
  message: string;
  data: T;
};
