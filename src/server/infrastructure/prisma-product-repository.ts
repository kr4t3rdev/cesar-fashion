import type { Product, Prisma } from "@prisma/client";
import type { ProductEntity, ProductInput } from "@/server/domain/product";
import type { ProductRepositoryPort } from "@/server/domain/repositories";
import { prisma } from "./prisma";

function toEntity(p: Product): ProductEntity {
  return {
    ...p,
    price: Number(p.price),
    salePrice: p.salePrice === null ? null : Number(p.salePrice),
  };
}

function toDb(input: ProductInput): Prisma.ProductCreateInput {
  const { salePrice, ...rest } = input;
  return {
    ...rest,
    price: input.price,
    salePrice: salePrice === null || salePrice === undefined ? null : salePrice,
  };
}

export class PrismaProductRepository implements ProductRepositoryPort {
  async findAll(options?: { includeOnSale?: boolean }): Promise<ProductEntity[]> {
    const products = await prisma.product.findMany({
      where: options?.includeOnSale ? { isOnSale: true } : undefined,
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    });
    return products.map(toEntity);
  }

  async findById(id: string): Promise<ProductEntity | null> {
    const p = await prisma.product.findUnique({ where: { id } });
    return p ? toEntity(p) : null;
  }

  async create(input: ProductInput): Promise<ProductEntity> {
    const p = await prisma.product.create({ data: toDb(input) });
    return toEntity(p);
  }

  async update(id: string, input: Partial<ProductInput>): Promise<ProductEntity | null> {
    const p = await prisma.product.update({ where: { id }, data: toDb(input as ProductInput) }).catch(() => null);
    return p ? toEntity(p) : null;
  }

  async delete(id: string): Promise<boolean> {
    return prisma.product
      .delete({ where: { id } })
      .then(() => true)
      .catch(() => false);
  }
}

export const productRepository: ProductRepositoryPort = new PrismaProductRepository();
