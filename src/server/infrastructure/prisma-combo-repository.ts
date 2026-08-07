import type { Combo, ComboItem, Prisma } from "@prisma/client";
import type { ComboEntity, ComboInput, ComboItemEntity } from "@/server/domain/combo";
import type { ComboRepositoryPort } from "@/server/domain/repositories";
import { prisma } from "./prisma";

type ComboWithItems = Combo & { items: (ComboItem & { product: { id: string; name: string; imageUrl: string | null; stock: number; price: Prisma.Decimal; currency: string } })[] };

function toEntity(c: ComboWithItems): ComboEntity {
  return {
    id: c.id,
    name: c.name,
    description: c.description,
    price: Number(c.price),
    salePrice: c.salePrice === null ? null : Number(c.salePrice),
    currency: c.currency,
    imageUrl: c.imageUrl,
    isOnSale: c.isOnSale,
    saleLabel: c.saleLabel,
    featured: c.featured,
    isActive: c.isActive,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    items: c.items.map(
      (i): ComboItemEntity => ({
        id: i.id,
        comboId: i.comboId,
        productId: i.productId,
        quantity: i.quantity,
        product: {
          id: i.product.id,
          name: i.product.name,
          imageUrl: i.product.imageUrl,
          stock: i.product.stock,
          price: Number(i.product.price),
          currency: i.product.currency,
        },
      })
    ),
  };
}

const include = {
  items: {
    include: {
      product: { select: { id: true, name: true, imageUrl: true, stock: true, price: true, currency: true } },
    },
    orderBy: { product: { name: "asc" } },
  },
} satisfies Prisma.ComboInclude;

export class PrismaComboRepository implements ComboRepositoryPort {
  async findAll(options?: { includeInactive?: boolean }): Promise<ComboEntity[]> {
    const combos = await prisma.combo.findMany({
      where: options?.includeInactive ? undefined : { isActive: true },
      include,
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    });
    return combos.map(toEntity);
  }

  async findById(id: string): Promise<ComboEntity | null> {
    const c = await prisma.combo.findUnique({ where: { id }, include });
    return c ? toEntity(c) : null;
  }

  async create(input: ComboInput): Promise<ComboEntity> {
    const c = await prisma.combo.create({
      data: {
        name: input.name,
        description: input.description,
        price: input.price,
        salePrice: input.salePrice === null || input.salePrice === undefined ? null : input.salePrice,
        currency: input.currency ?? "USD",
        imageUrl: input.imageUrl === null || input.imageUrl === undefined ? null : input.imageUrl,
        isOnSale: input.isOnSale ?? false,
        saleLabel: input.saleLabel === null || input.saleLabel === undefined ? null : input.saleLabel,
        featured: input.featured ?? false,
        items: {
          create: input.items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        },
      },
      include,
    });
    return toEntity(c);
  }

  async update(id: string, input: Partial<ComboInput>): Promise<ComboEntity | null> {
    const existing = await prisma.combo.findUnique({ where: { id } });
    if (!existing) return null;

    const data: Prisma.ComboUpdateInput = {
      name: input.name,
      description: input.description,
      price: input.price,
      salePrice:
        input.salePrice === undefined
          ? undefined
          : input.salePrice === null
            ? null
            : input.salePrice,
      currency: input.currency,
      imageUrl: input.imageUrl === undefined ? undefined : input.imageUrl ?? null,
      isOnSale: input.isOnSale,
      saleLabel: input.saleLabel === undefined ? undefined : input.saleLabel ?? null,
      featured: input.featured,
      isActive: input.isActive,
    };

    if (input.items) {
      data.items = {
        deleteMany: {},
        create: input.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      };
    }

    const c = await prisma.combo
      .update({
        where: { id },
        data,
        include,
      })
      .catch(() => null);
    return c ? toEntity(c) : null;
  }

  async delete(id: string): Promise<boolean> {
    return prisma.combo
      .delete({ where: { id } })
      .then(() => true)
      .catch(() => false);
  }
}

export const comboRepository: ComboRepositoryPort = new PrismaComboRepository();
