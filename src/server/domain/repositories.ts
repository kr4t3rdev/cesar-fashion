import type { ProductEntity, ProductInput } from "@/server/domain/product";

export interface ProductRepositoryPort {
  findAll(options?: { includeOnSale?: boolean }): Promise<ProductEntity[]>;
  findById(id: string): Promise<ProductEntity | null>;
  create(input: ProductInput): Promise<ProductEntity>;
  update(id: string, input: Partial<ProductInput>): Promise<ProductEntity | null>;
  delete(id: string): Promise<boolean>;
}
