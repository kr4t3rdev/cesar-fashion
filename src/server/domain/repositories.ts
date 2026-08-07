import type { ProductEntity, ProductInput } from "@/server/domain/product";
import type { UserEntity, UserInput } from "@/server/domain/user";
import type { ComboEntity, ComboInput } from "@/server/domain/combo";
import type { WholesaleSaleEntity, WholesaleSaleInput } from "@/server/domain/wholesale";

export interface ProductRepositoryPort {
  findAll(options?: { includeOnSale?: boolean }): Promise<ProductEntity[]>;
  findById(id: string): Promise<ProductEntity | null>;
  create(input: ProductInput): Promise<ProductEntity>;
  update(id: string, input: Partial<ProductInput>): Promise<ProductEntity | null>;
  delete(id: string): Promise<boolean>;
}

export interface UserRepositoryPort {
  findAll(): Promise<UserEntity[]>;
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  create(input: UserInput): Promise<UserEntity>;
  update(id: string, input: Partial<UserInput>): Promise<UserEntity | null>;
  delete(id: string): Promise<boolean>;
}

export interface ComboRepositoryPort {
  findAll(options?: { includeInactive?: boolean }): Promise<ComboEntity[]>;
  findById(id: string): Promise<ComboEntity | null>;
  create(input: ComboInput): Promise<ComboEntity>;
  update(id: string, input: Partial<ComboInput>): Promise<ComboEntity | null>;
  delete(id: string): Promise<boolean>;
}

export interface WholesaleSaleRepositoryPort {
  findAll(options?: { limit?: number }): Promise<WholesaleSaleEntity[]>;
  registerSale(
    input: WholesaleSaleInput & { createdById?: string | null }
  ): Promise<{ ok: true; sale: WholesaleSaleEntity } | { ok: false; message: string }>;
  productTotalUnitsSold(productId: string): Promise<number>;
}
