import { z } from "zod";
import type { ProductEntity } from "@/server/domain/product";

export type WholesaleProductEntity = ProductEntity;

export const wholesaleDeclarationSchema = z.object({
  productId: z.string().min(1, "Selecciona un producto"),
  wholesaleUnitName: z
    .string()
    .trim()
    .min(1, "Indica el nombre de la unidad (ej. caja, docena, pack)")
    .max(120),
  wholesaleUnitQuantity: z.coerce.number().int("Debe ser entero").min(1, "Debe ser al menos 1").max(1_000_000),
});

export type WholesaleDeclarationInput = z.infer<typeof wholesaleDeclarationSchema>;

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
