import { revalidatePath } from "next/cache";
import { saleInputSchema, type SaleInputSchema } from "@/server/domain/sale-schema";
import type { ActionResult } from "@/server/domain/sale-schema";
import type { WholesaleProductEntity, WholesaleSaleEntity, WholesaleSaleSummary } from "@/server/domain/wholesale";
import type { WholesaleSaleRepositoryPort } from "@/server/domain/repositories";
import { wholesaleSaleRepository } from "@/server/infrastructure/prisma-wholesale-repository";
import { productRepository } from "@/server/infrastructure/prisma-product-repository";

export interface WholesaleService {
  listWholesaleProducts(): Promise<WholesaleProductEntity[]>;
  listSales(options?: { limit?: number }): Promise<WholesaleSaleEntity[]>;
  summary(limit?: number): Promise<WholesaleSaleSummary>;
  registerSale(input: unknown, createdById?: string | null): Promise<ActionResult>;
}

export function createWholesaleService(repo: WholesaleSaleRepositoryPort): WholesaleService {
  const parse = (raw: unknown) => {
    const result = saleInputSchema.safeParse(raw);
    if (!result.success) {
      return { ok: false as const, message: "Datos inválidos", fieldErrors: result.error.flatten().fieldErrors };
    }
    return { ok: true as const, data: result.data as SaleInputSchema };
  };

  return {
    async listWholesaleProducts() {
      const products = await productRepository.findAll();
      return products.filter((p) => p.isWholesale);
    },

    async listSales(options) {
      return repo.findAll(options);
    },

    async summary(limit = 5) {
      const all = await repo.findAll();
      const totalRevenue = all.reduce((acc, s) => acc + s.total, 0);
      const totalPiecesSold = all.reduce((acc, s) => acc + s.pieces, 0);
      return {
        totalSales: all.length,
        totalRevenue,
        totalPiecesSold,
        recentSales: all.slice(0, limit),
      };
    },

    async registerSale(raw, createdById) {
      const parsed = parse(raw);
      if (!parsed.ok) return parsed;
      const data = parsed.data;

      const product = await productRepository.findById(data.productId);
      if (!product) return { ok: false, message: "Producto no encontrado" };
      if (!product.isWholesale) {
        return { ok: false, message: "Este producto no está registrado para venta al por mayor" };
      }

      const pieces = data.piecesPerUnit * data.units;
      const result = await repo.registerSale({
        productId: data.productId,
        unitName: data.unitName,
        piecesPerUnit: data.piecesPerUnit,
        units: data.units,
        pricePerUnit: data.pricePerUnit,
        customer: data.customer,
        note: data.note,
        createdById,
      });

      if (!result.ok) return { ok: false, message: result.message };

      const totalPieces = product.stock - pieces;
      revalidatePath("/admin/mayoreo");
      revalidatePath("/admin");
      if (totalPieces <= 0) revalidatePath("/catalogo");
      return {
        ok: true,
        message: `Venta registrada: ${data.units} ${data.unitName.toLowerCase()}${
          data.units > 1 ? "s" : ""
        } (${pieces} piezas) por ${data.pricePerUnit * data.units}`,
      };
    },
  };
}

export const wholesaleService = createWholesaleService(wholesaleSaleRepository);
