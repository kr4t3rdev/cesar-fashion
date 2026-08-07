import { revalidatePath } from "next/cache";
import { productInputSchema, type ProductInputSchema } from "@/server/domain/product-schema";
import type { ProductEntity } from "@/server/domain/product";
import type { ActionResult } from "@/server/domain/product-schema";
import type { ProductRepositoryPort } from "@/server/domain/repositories";
import { productRepository } from "@/server/infrastructure/prisma-product-repository";

export interface ProductService {
  listProducts(): Promise<ProductEntity[]>;
  listOnSaleProducts(): Promise<ProductEntity[]>;
  getProduct(id: string): Promise<ProductEntity | null>;
  createProduct(input: unknown): Promise<ActionResult>;
  updateProduct(id: string, input: unknown): Promise<ActionResult>;
  toggleSale(id: string): Promise<ActionResult>;
  deleteProduct(id: string): Promise<ActionResult>;
}

export function createProductService(repo: ProductRepositoryPort): ProductService {
  const parse = (
    raw: unknown
  ):
    | { ok: true; data: ProductInputSchema }
    | { ok: false; message: string; fieldErrors: Record<string, string[]> } => {
    const result = productInputSchema.safeParse(raw);
    if (!result.success) {
      return { ok: false, message: "Datos inválidos", fieldErrors: result.error.flatten().fieldErrors };
    }
    return { ok: true, data: result.data };
  };

  return {
    async listProducts() {
      return repo.findAll();
    },

    async listOnSaleProducts() {
      return repo.findAll({ includeOnSale: true });
    },

    async getProduct(id) {
      return repo.findById(id);
    },

    async createProduct(raw: unknown) {
      const parsed = parse(raw);
      if (!parsed.ok) return parsed;
      const data = parsed.data as ProductInputSchema;
      await repo.create({
        name: data.name,
        description: data.description,
        category: data.category,
        price: data.price,
        salePrice: data.salePrice,
        currency: data.currency,
        stock: data.stock,
        imageUrl: data.imageUrl,
        isOnSale: data.isOnSale,
        saleLabel: data.saleLabel,
        featured: data.featured,
        isWholesale: data.isWholesale,
        wholesaleUnitName: data.wholesaleUnitName,
        wholesaleUnitQuantity: data.wholesaleUnitQuantity,
      });
      revalidatePath("/");
      revalidatePath("/ofertas");
      revalidatePath("/admin");
      revalidatePath("/admin/mayoreo");
      return { ok: true, message: "Producto creado correctamente" };
    },

    async updateProduct(id, raw) {
      const parsed = parse(raw);
      if (!parsed.ok) return parsed;
      const data = parsed.data as ProductInputSchema;
      await repo.update(id, {
        name: data.name,
        description: data.description,
        category: data.category,
        price: data.price,
        salePrice: data.salePrice,
        currency: data.currency,
        stock: data.stock,
        imageUrl: data.imageUrl,
        isOnSale: data.isOnSale,
        saleLabel: data.saleLabel,
        featured: data.featured,
        isWholesale: data.isWholesale,
        wholesaleUnitName: data.wholesaleUnitName,
        wholesaleUnitQuantity: data.wholesaleUnitQuantity,
      });
      revalidatePath("/");
      revalidatePath("/ofertas");
      revalidatePath("/admin");
      revalidatePath("/admin/mayoreo");
      return { ok: true, message: "Producto actualizado correctamente" };
    },

    async toggleSale(id) {
      const product = await repo.findById(id);
      if (!product) return { ok: false, message: "Producto no encontrado" };
      const next = !product.isOnSale;
      if (next && (product.salePrice === null || product.salePrice <= 0)) {
        return { ok: false, message: "Configura un precio de oferta antes de activar la oferta" };
      }
      await repo.update(id, { isOnSale: next });
      revalidatePath("/");
      revalidatePath("/ofertas");
      revalidatePath("/admin");
      return {
        ok: true,
        message: next ? "Producto añadido a ofertas" : "Oferta desactivada",
      };
    },

    async deleteProduct(id) {
      const ok = await repo.delete(id);
      revalidatePath("/");
      revalidatePath("/ofertas");
      revalidatePath("/admin");
      return ok
        ? { ok: true, message: "Producto eliminado" }
        : { ok: false, message: "No se pudo eliminar el producto" };
    },
  };
}

export const productService = createProductService(productRepository);
