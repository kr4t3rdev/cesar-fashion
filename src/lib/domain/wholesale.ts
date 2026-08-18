import type { ProductEntity } from "@/lib/domain/product";

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

export interface ActionResult {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
}