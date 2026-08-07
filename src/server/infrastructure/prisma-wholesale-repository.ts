import type { WholesaleSale } from "@prisma/client";
import type { WholesaleSaleEntity, WholesaleSaleInput } from "@/server/domain/wholesale";
import type { WholesaleSaleRepositoryPort } from "@/server/domain/repositories";
import { prisma } from "./prisma";

type SaleWithRelations = WholesaleSale & { product: { name: string; imageUrl: string | null }; createdBy: { name: string | null } | null };

function toEntity(s: SaleWithRelations): WholesaleSaleEntity {
  return {
    id: s.id,
    productId: s.productId,
    productName: s.product.name,
    productImageUrl: s.product.imageUrl,
    unitName: s.unitName,
    piecesPerUnit: s.piecesPerUnit,
    units: s.units,
    pieces: s.pieces,
    pricePerUnit: Number(s.pricePerUnit),
    total: Number(s.total),
    customer: s.customer,
    note: s.note,
    createdAt: s.createdAt,
    createdByName: s.createdBy?.name ?? null,
  };
}

export class PrismaWholesaleSaleRepository implements WholesaleSaleRepositoryPort {
  async findAll(options?: { limit?: number }): Promise<WholesaleSaleEntity[]> {
    const sales = await prisma.wholesaleSale.findMany({
      include: { product: { select: { name: true, imageUrl: true } }, createdBy: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: options?.limit,
    });
    return sales.map(toEntity);
  }

  async registerSale(
    input: WholesaleSaleInput & { createdById?: string | null }
  ): Promise<{ ok: true; sale: WholesaleSaleEntity } | { ok: false; message: string }> {
    const pieces = input.piecesPerUnit * input.units;
    const total = Number((input.pricePerUnit * input.units).toFixed(2));

    return prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: input.productId }, select: { id: true, stock: true } });
      if (!product) return { ok: false as const, message: "Producto no encontrado" };
      if (product.stock < pieces) {
        return {
          ok: false as const,
          message: `Stock insuficiente: se necesitan ${pieces} piezas y hay ${product.stock} disponibles`,
        };
      }

      const [, sale] = await Promise.all([
        tx.product.update({
          where: { id: input.productId },
          data: { stock: { decrement: pieces } },
        }),
        tx.wholesaleSale.create({
          data: {
            productId: input.productId,
            unitName: input.unitName,
            piecesPerUnit: input.piecesPerUnit,
            units: input.units,
            pieces,
            pricePerUnit: input.pricePerUnit,
            total,
            customer: input.customer ?? null,
            note: input.note ?? null,
            createdById: input.createdById ?? null,
          },
          include: { product: { select: { name: true, imageUrl: true } }, createdBy: { select: { name: true } } },
        }),
      ]);

      return { ok: true as const, sale: toEntity(sale) };
    });
  }

  async productTotalUnitsSold(productId: string): Promise<number> {
    const agg = await prisma.wholesaleSale.aggregate({
      where: { productId },
      _sum: { pieces: true },
    });
    return agg._sum.pieces ?? 0;
  }
}

export const wholesaleSaleRepository: WholesaleSaleRepositoryPort = new PrismaWholesaleSaleRepository();
