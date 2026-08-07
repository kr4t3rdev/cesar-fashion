export const CATEGORIES = [
  "Camisetas",
  "Pantalones",
  "Chaquetas",
  "Vestidos",
  "Zapatos",
  "Accesorios",
  "Sudaderas",
  "Abrigos",
  "Belleza Mary Kay",
  "Teléfonos",
  "Accesorios para teléfonos",
  "Aseo personal",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface ProductEntity {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  salePrice: number | null;
  currency: string;
  stock: number;
  imageUrl: string | null;
  isOnSale: boolean;
  saleLabel: string | null;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductInput {
  name: string;
  description: string;
  category: string;
  price: number;
  salePrice?: number | null;
  currency?: string;
  stock: number;
  imageUrl?: string | null;
  isOnSale?: boolean;
  saleLabel?: string | null;
  featured?: boolean;
}

export interface SaleProduct
  extends Pick<
    ProductEntity,
    "id" | "name" | "description" | "category" | "price" | "salePrice" | "imageUrl" | "currency" | "stock"
  > {
  saleLabel: string | null;
}

export function productIsOnSale(p: Pick<ProductEntity, "isOnSale" | "salePrice" | "stock">): boolean {
  return p.isOnSale && p.salePrice !== null && p.salePrice > 0 && p.stock > 0;
}

export function productDiscountPercent(p: Pick<ProductEntity, "price" | "salePrice">): number | null {
  if (!productIsOnSale({ ...p, isOnSale: true, stock: 1 })) return null;
  if (p.salePrice === null || p.price <= 0) return null;
  return Math.round((1 - p.salePrice / p.price) * 100);
}
