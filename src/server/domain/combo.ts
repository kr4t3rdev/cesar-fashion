export interface ComboItemProduct {
  id: string;
  name: string;
  imageUrl: string | null;
  stock: number;
  price: number;
  currency: string;
}

export interface ComboItemEntity {
  id: string;
  comboId: string;
  productId: string;
  quantity: number;
  product: ComboItemProduct;
}

export interface ComboEntity {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice: number | null;
  currency: string;
  imageUrl: string | null;
  isOnSale: boolean;
  saleLabel: string | null;
  featured: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  items: ComboItemEntity[];
}

export interface ComboItemInput {
  productId: string;
  quantity: number;
}

export interface ComboInput {
  name: string;
  description: string;
  price: number;
  salePrice?: number | null;
  currency?: string;
  imageUrl?: string | null;
  isOnSale?: boolean;
  saleLabel?: string | null;
  featured?: boolean;
  isActive?: boolean;
  items: ComboItemInput[];
}

export function comboIsOnSale(c: Pick<ComboEntity, "isOnSale" | "salePrice">): boolean {
  return c.isOnSale && c.salePrice !== null && c.salePrice > 0;
}

export function comboDiscountPercent(c: Pick<ComboEntity, "price" | "salePrice" | "isOnSale">): number | null {
  if (!comboIsOnSale(c)) return null;
  if (c.salePrice === null || c.price <= 0) return null;
  return Math.round((1 - c.salePrice / c.price) * 100);
}

export function comboTotalUnits(items: { quantity: number }[]): number {
  return items.reduce((acc, i) => acc + i.quantity, 0);
}

export function comboAvailable(c: Pick<ComboEntity, "items">): boolean {
  if (c.items.length === 0) return false;
  return c.items.every((i) => i.product.stock >= i.quantity);
}
