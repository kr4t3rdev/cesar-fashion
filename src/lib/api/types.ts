// Tipos del API cesar-fashion-api (alineados con ProductResponse,
// ComboResponse y OrderResponse de interfaces/rest).

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  salePrice: number | null;
  currency: string;
  stock: number;
  imageUrl: string | null;
  onSale: boolean;
  saleLabel: string | null;
  featured: boolean;
  isWholesale: boolean;
  wholesaleUnitName: string | null;
  wholesaleUnitQuantity: number;
  effectivePrice: number;
  discountPercent: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ComboItemProduct {
  id: string;
  name: string;
  imageUrl: string | null;
  stock: number;
  price: number;
  currency: string;
}

export interface ComboItem {
  id: string;
  productId: string;
  quantity: number;
  product: ComboItemProduct;
}

export interface Combo {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice: number | null;
  currency: string;
  imageUrl: string | null;
  onSale: boolean;
  saleLabel: string | null;
  featured: boolean;
  isActive: boolean;
  available: boolean;
  maxQuantity: number;
  effectivePrice: number;
  discountPercent: number | null;
  items: ComboItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string | null;
  kind: "product" | "combo";
  productId: string | null;
  comboId: string | null;
  name: string;
  unitPrice: number;
  quantity: number;
  currency: string;
}

export interface Order {
  id: string;
  customerId: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  note: string | null;
  currency: string;
  subtotal: number;
  total: number;
  status: "pending" | "paid" | "cancelled";
  reference: string;
  confirmedByName: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "gestor" | "usuario";
  status: "active" | "pending" | "disabled";
  createdAt: string;
  updatedAt: string;
}

export interface AuthMe {
  id: string;
  name: string;
  email: string;
  role: "admin" | "gestor" | "usuario";
  status: "active" | "pending" | "disabled";
}

// Inputs de mutación
export interface ProductInput {
  name: string;
  description: string;
  category: string;
  price: number;
  salePrice?: number | null;
  currency?: string;
  stock: number;
  imageUrl?: string | null;
  isOnSale?: boolean;
  saleLabel?: string | null;
  featured?: boolean;
  isWholesale?: boolean;
  wholesaleUnitName?: string | null;
  wholesaleUnitQuantity?: number;
}

export interface ComboInput {
  name: string;
  description: string;
  price: number;
  salePrice?: number | null;
  currency?: string;
  imageUrl?: string | null;
  isOnSale?: boolean;
  saleLabel?: string | null;
  featured?: boolean;
  isActive?: boolean;
  items: { productId: string; quantity: number }[];
}

export interface OrderItemInput {
  productId?: string;
  comboId?: string;
  quantity: number;
}

export interface OrderInput {
  customerName: string;
  customerPhone: string;
  note?: string | null;
  items: OrderItemInput[];
}

export interface UserInput {
  name: string;
  email: string;
  password?: string;
  role?: "admin" | "gestor" | "usuario";
  status?: "active" | "disabled";
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface WholesaleDeclarationInput {
  productId: string;
  wholesaleUnitName: string;
  wholesaleUnitQuantity: number;
}

export interface UploadResponse {
  ok: boolean;
  url: string;
}