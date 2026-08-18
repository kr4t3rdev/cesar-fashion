import type {
  Combo as ApiCombo,
  ComboItem as ApiComboItem,
  Order as ApiOrder,
  Product as ApiProduct,
  User as ApiUser,
} from "./types";
import type { ComboEntity, ComboItemEntity } from "@/lib/domain/combo";
import type { OrderEntity } from "@/lib/domain/order";
import type { ProductEntity } from "@/lib/domain/product";
import type { UserEntity, UserStatus } from "@/lib/domain/user";

/**
 * Adaptadores API → tipos de dominio. Permiten migrar las páginas de solo
 * lectura al API sin tocar los componentes (ProductCard, ComboCard, ...).
 */
export function productFromApi(p: ApiProduct): ProductEntity {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    category: p.category,
    price: p.price,
    salePrice: p.salePrice,
    currency: p.currency,
    stock: p.stock,
    imageUrl: p.imageUrl,
    isOnSale: p.onSale,
    saleLabel: p.saleLabel,
    featured: p.featured,
    isWholesale: p.isWholesale,
    wholesaleUnitName: p.wholesaleUnitName,
    wholesaleUnitQuantity: p.wholesaleUnitQuantity,
    createdAt: new Date(p.createdAt),
    updatedAt: new Date(p.updatedAt),
  };
}

function comboItemFromApi(comboId: string, item: ApiComboItem): ComboItemEntity {
  return {
    id: item.id,
    comboId,
    productId: item.productId,
    quantity: item.quantity,
    product: {
      id: item.product.id,
      name: item.product.name,
      imageUrl: item.product.imageUrl,
      stock: item.product.stock,
      price: item.product.price,
      currency: item.product.currency,
    },
  };
}

export function comboFromApi(c: ApiCombo): ComboEntity {
  return {
    id: c.id,
    name: c.name,
    description: c.description,
    price: c.price,
    salePrice: c.salePrice,
    currency: c.currency,
    imageUrl: c.imageUrl,
    isOnSale: c.onSale,
    saleLabel: c.saleLabel,
    featured: c.featured,
    isActive: c.isActive,
    createdAt: new Date(c.createdAt),
    updatedAt: new Date(c.updatedAt),
    items: c.items.map((item) => comboItemFromApi(c.id, item)),
  };
}

export function orderFromApi(o: ApiOrder): OrderEntity {
  return {
    id: o.id,
    customerId: o.customerId,
    customerName: o.customerName,
    customerPhone: o.customerPhone ?? null,
    customerEmail: o.customerEmail ?? null,
    note: o.note,
    currency: o.currency,
    subtotal: o.subtotal,
    total: o.total,
    status: o.status,
    createdAt: new Date(o.createdAt),
    updatedAt: new Date(o.updatedAt),
    confirmedByName: o.confirmedByName ?? null,
    items: o.items.map((item) => ({
      id: item.id,
      orderId: item.orderId ?? o.id,
      kind: item.kind,
      productId: item.productId,
      comboId: item.comboId,
      name: item.name,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      currency: item.currency,
    })),
  };
}

export function userFromApi(u: ApiUser): UserEntity {
  return {
    id: u.id,
    name: u.name ?? null,
    email: u.email,
    role: u.role,
    status: u.status as UserStatus,
    createdAt: new Date(u.createdAt),
    updatedAt: new Date(u.updatedAt),
  };
}