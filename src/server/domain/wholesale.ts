import type { ProductEntity } from "@/server/domain/product";

export type WholesaleProductEntity = ProductEntity;

export function productHasWholesaleUnit(
  p: Pick<ProductEntity, "isWholesale" | "wholesaleUnitName" | "wholesaleUnitQuantity">
): boolean {
  return p.isWholesale && Boolean(p.wholesaleUnitName) && p.wholesaleUnitQuantity > 0;
}

export function wholesaleUnitsAvailable(
  p: Pick<ProductEntity, "stock" | "wholesaleUnitQuantity">,
  unitSize = 1
): number {
  return Math.floor(p.stock / unitSize);
}

export interface WholesaleSaleEntity {
  id: string;
  productId: string;
  productName: string;
  productImageUrl: string | null;
  unitName: string;
  piecesPerUnit: number;
  units: number;
  pieces: number;
  pricePerUnit: number;
  total: number;
  customer: string | null;
  note: string | null;
  createdAt: Date;
  createdByName: string | null;
}

export interface WholesaleSaleInput {
  productId: string;
  unitName: string;
  piecesPerUnit: number;
  units: number;
  pricePerUnit: number;
  customer?: string | null;
  note?: string | null;
}

export interface WholesaleSaleSummary {
  totalSales: number;
  totalRevenue: number;
  totalPiecesSold: number;
  recentSales: WholesaleSaleEntity[];
}
