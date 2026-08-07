import { revalidatePath } from "next/cache";
import {
  wholesaleDeclarationSchema,
  type ActionResult,
  type WholesaleDeclarationInput,
  type WholesaleProductEntity,
} from "@/server/domain/wholesale";
import type { ProductEntity } from "@/server/domain/product";
import { productRepository } from "@/server/infrastructure/prisma-product-repository";

export interface WholesaleService {
  listProducts(): Promise<ProductEntity[]>;
  listWholesaleProducts(): Promise<WholesaleProductEntity[]>;
  declareProduct(input: unknown): Promise<ActionResult>;
  undeclareProduct(id: string): Promise<ActionResult>;
}

export function createWholesaleService(): WholesaleService {
  const parse = (
    raw: unknown
  ):
    | { ok: true; data: WholesaleDeclarationInput }
    | { ok: false; message: string; fieldErrors: Record<string, string[]> } => {
    const result = wholesaleDeclarationSchema.safeParse(raw);
    if (!result.success) {
      return { ok: false, message: "Datos inválidos", fieldErrors: result.error.flatten().fieldErrors };
    }
    return { ok: true, data: result.data };
  };

  return {
    async listProducts() {
      return productRepository.findAll();
    },

    async listWholesaleProducts() {
      const products = await productRepository.findAll();
      return products.filter((p) => p.isWholesale);
    },

    async declareProduct(raw) {
      const parsed = parse(raw);
      if (!parsed.ok) return parsed;
      const data = parsed.data;

      const product = await productRepository.findById(data.productId);
      if (!product) return { ok: false, message: "Producto no encontrado" };

      await productRepository.update(data.productId, {
        isWholesale: true,
        wholesaleUnitName: data.wholesaleUnitName,
        wholesaleUnitQuantity: data.wholesaleUnitQuantity,
      });

      revalidatePath("/admin/mayoreo");
      revalidatePath("/admin");
      revalidatePath("/");
      return {
        ok: true,
        message: `Producto declarado al por mayor: ${data.wholesaleUnitQuantity} pz por ${data.wholesaleUnitName.toLowerCase()}`,
      };
    },

    async undeclareProduct(id) {
      const product = await productRepository.findById(id);
      if (!product) return { ok: false, message: "Producto no encontrado" };
      if (!product.isWholesale) return { ok: false, message: "El producto no está declarado al por mayor" };

      await productRepository.update(id, {
        isWholesale: false,
        wholesaleUnitName: null,
        wholesaleUnitQuantity: 1,
      });

      revalidatePath("/admin/mayoreo");
      revalidatePath("/admin");
      revalidatePath("/");
      return { ok: true, message: "Producto retirado de la venta al por mayor" };
    },
  };
}

export const wholesaleService = createWholesaleService();
