import { revalidatePath } from "next/cache";
import { orderInputSchema, cartLineSchema } from "@/server/domain/order-schema";
import { orderReference, type CartLine, type OrderItemInput, type StockEffect } from "@/server/domain/order";
import { productEffectivePrice } from "@/server/domain/product";
import { comboEffectivePrice, comboMaxQuantity } from "@/server/domain/combo";
import type { ActionResult } from "@/server/domain/sale-schema";
import type { OrderEntity, OrderStatus } from "@/server/domain/order";
import type { OrderRepositoryPort } from "@/server/domain/repositories";
import { orderRepository } from "@/server/infrastructure/prisma-order-repository";
import { productRepository } from "@/server/infrastructure/prisma-product-repository";
import { comboRepository } from "@/server/infrastructure/prisma-combo-repository";

function round2(n: number): number {
  return Number(n.toFixed(2));
}

export interface OrderActionResult extends ActionResult {
  orderId?: string;
  reference?: string;
}

export interface OrderService {
  createOrder(cart: unknown, customer: unknown): Promise<OrderActionResult>;
  listOrders(options?: { limit?: number; status?: OrderStatus }): Promise<OrderEntity[]>;
  getOrder(id: string): Promise<OrderEntity | null>;
  pendingCount(): Promise<number>;
  setStatus(id: string, status: OrderStatus, confirmedById?: string | null): Promise<ActionResult>;
}

export function createOrderService(repo: OrderRepositoryPort): OrderService {
  return {
    async createOrder(rawCart, rawCustomer) {
      const customer = orderInputSchema.safeParse(rawCustomer);
      if (!customer.success) {
        return { ok: false, message: "Revisa tus datos", fieldErrors: customer.error.flatten().fieldErrors };
      }

      const parsed = cartLineSchema.array().safeParse(rawCart);
      if (!parsed.success) return { ok: false, message: "El carrito contiene datos inválidos" };
      const lines = parsed.data as CartLine[];
      if (lines.length === 0) return { ok: false, message: "El carrito está vacío" };

      const orderItems: OrderItemInput[] = [];
      const stockEffects: StockEffect[] = [];
      let subtotal = 0;
      let currency = "USD";

      for (const line of lines) {
        if (line.kind === "product") {
          const product = await productRepository.findById(line.id);
          if (!product) {
            return { ok: false, message: "Uno de los productos ya no está disponible" };
          }
          if (product.stock < line.quantity) {
            return { ok: false, message: `Stock insuficiente para "${product.name}"` };
          }
          const unitPrice = productEffectivePrice(product);
          orderItems.push({
            kind: "product",
            productId: product.id,
            comboId: null,
            name: product.name,
            unitPrice,
            quantity: line.quantity,
            currency: product.currency,
          });
          stockEffects.push({ productId: product.id, quantity: line.quantity });
          subtotal += unitPrice * line.quantity;
          currency = product.currency;
        } else {
          const combo = await comboRepository.findById(line.id);
          if (!combo || !combo.isActive) {
            return { ok: false, message: "Uno de los combos ya no está disponible" };
          }
          const max = comboMaxQuantity(combo);
          if (max < line.quantity) {
            return { ok: false, message: `Stock insuficiente para "${combo.name}"` };
          }
          const unitPrice = comboEffectivePrice(combo);
          orderItems.push({
            kind: "combo",
            productId: null,
            comboId: combo.id,
            name: combo.name,
            unitPrice,
            quantity: line.quantity,
            currency: combo.currency,
          });
          for (const item of combo.items) {
            stockEffects.push({ productId: item.productId, quantity: item.quantity * line.quantity });
          }
          subtotal += unitPrice * line.quantity;
          currency = combo.currency;
        }
      }

      const result = await repo.createOrder({
        customerName: customer.data.customerName,
        customerPhone: customer.data.customerPhone ?? null,
        customerEmail: customer.data.customerEmail ?? null,
        note: customer.data.note ?? null,
        currency,
        subtotal: round2(subtotal),
        total: round2(subtotal),
        items: orderItems,
        stockEffects,
      });

      if (!result.ok) return { ok: false, message: result.message };

      revalidatePath("/admin/pedidos");
      revalidatePath("/admin");
      revalidatePath("/catalogo");
      revalidatePath("/combos");
      revalidatePath("/");

      return {
        ok: true,
        message: "Pedido registrado correctamente",
        orderId: result.order.id,
        reference: orderReference(result.order.id),
      };
    },

    async listOrders(options) {
      return repo.findAll(options);
    },

    async getOrder(id) {
      return repo.findById(id);
    },

    async pendingCount() {
      return repo.countPending();
    },

    async setStatus(id, status, confirmedById) {
      const order = await repo.findById(id);
      if (!order) return { ok: false, message: "Pedido no encontrado" };
      if (order.status !== "pending") {
        return { ok: false, message: "Solo se pueden gestionar pedidos pendientes" };
      }

      const result = await repo.setStatus(id, status, confirmedById);
      if (!result.ok) return { ok: false, message: result.message };

      revalidatePath("/admin/pedidos");
      revalidatePath("/admin");
      revalidatePath("/catalogo");
      revalidatePath("/combos");
      revalidatePath("/");

      const label = status === "paid" ? "marcado como pagado" : "cancelado";
      return { ok: true, message: `Pedido ${orderReference(id)} ${label}` };
    },
  };
}

export const orderService = createOrderService(orderRepository);
