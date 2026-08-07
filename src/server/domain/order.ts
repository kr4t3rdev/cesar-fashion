export type OrderStatus = "pending" | "paid" | "cancelled";

export const ORDER_STATUSES: OrderStatus[] = ["pending", "paid", "cancelled"];

export interface OrderItemEntity {
  id: string;
  orderId: string;
  kind: "product" | "combo";
  productId: string | null;
  comboId: string | null;
  name: string;
  unitPrice: number;
  quantity: number;
  currency: string;
}

export interface OrderEntity {
  id: string;
  customerName: string;
  customerPhone: string | null;
  customerEmail: string | null;
  note: string | null;
  currency: string;
  subtotal: number;
  total: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  confirmedByName: string | null;
  items: OrderItemEntity[];
}

export interface CartLine {
  kind: "product" | "combo";
  id: string;
  quantity: number;
}

export interface OrderItemInput {
  kind: "product" | "combo";
  productId: string | null;
  comboId: string | null;
  name: string;
  unitPrice: number;
  quantity: number;
  currency: string;
}

export interface StockEffect {
  productId: string;
  quantity: number;
}

export interface OrderCreateInput {
  customerName: string;
  customerPhone: string | null;
  customerEmail: string | null;
  note: string | null;
  currency: string;
  subtotal: number;
  total: number;
  items: OrderItemInput[];
  stockEffects: StockEffect[];
}

export function orderReference(id: string): string {
  return `CF-${id.slice(-6).toUpperCase()}`;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pendiente",
  paid: "Pagado",
  cancelled: "Cancelado",
};
