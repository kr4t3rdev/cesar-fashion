import type { ProductEntity, ProductInput } from "@/server/domain/product";
import type { UserEntity, UserInput, UserStatus } from "@/server/domain/user";
import type { ComboEntity, ComboInput } from "@/server/domain/combo";
import type { OrderEntity, OrderCreateInput, OrderStatus } from "@/server/domain/order";

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
  findByEmailWithStatus(email: string): Promise<UserEntity | null>;
  create(input: UserInput): Promise<UserEntity>;
  update(id: string, input: Partial<UserInput>): Promise<UserEntity | null>;
  setStatus(id: string, status: UserStatus): Promise<UserEntity | null>;
  delete(id: string): Promise<boolean>;
}

export interface ComboRepositoryPort {
  findAll(options?: { includeInactive?: boolean }): Promise<ComboEntity[]>;
  findById(id: string): Promise<ComboEntity | null>;
  create(input: ComboInput): Promise<ComboEntity>;
  update(id: string, input: Partial<ComboInput>): Promise<ComboEntity | null>;
  delete(id: string): Promise<boolean>;
}

export interface OrderRepositoryPort {
  createOrder(
    input: OrderCreateInput
  ): Promise<{ ok: true; order: OrderEntity } | { ok: false; message: string }>;
  findAll(options?: { limit?: number; status?: OrderStatus }): Promise<OrderEntity[]>;
  findById(id: string): Promise<OrderEntity | null>;
  countPending(): Promise<number>;
  setStatus(
    id: string,
    status: OrderStatus,
    confirmedById?: string | null
  ): Promise<{ ok: true; order: OrderEntity } | { ok: false; message: string }>;
}
