import { Prisma, type Order } from "@prisma/client";
import type {
  OrderEntity,
  OrderCreateInput,
  OrderItemEntity,
  OrderStatus,
} from "@/server/domain/order";
import type { OrderRepositoryPort } from "@/server/domain/repositories";
import { prisma } from "./prisma";

type OrderItemRow = {
  id: string;
  orderId: string;
  kind: string;
  productId: string | null;
  comboId: string | null;
  name: string;
  unitPrice: Prisma.Decimal;
  quantity: number;
  currency: string;
};

type OrderWithRelations = Order & {
  items: OrderItemRow[];
  confirmedBy: { name: string | null } | null;
  customer: { name: string | null; email: string } | null;
};

function toEntity(o: OrderWithRelations): OrderEntity {
  return {
    id: o.id,
    customerId: o.customerId,
    customerName: o.customerName,
    customerPhone: o.customerPhone,
    customerEmail: o.customer?.email ?? o.customerEmail,
    note: o.note,
    currency: o.currency,
    subtotal: Number(o.subtotal),
    total: Number(o.total),
    status: o.status as OrderStatus,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
    confirmedByName: o.confirmedBy?.name ?? null,
    items: o.items.map((i) => ({
      id: i.id,
      orderId: i.orderId,
      kind: i.kind as OrderItemEntity["kind"],
      productId: i.productId,
      comboId: i.comboId,
      name: i.name,
      unitPrice: Number(i.unitPrice),
      quantity: i.quantity,
      currency: i.currency,
    })),
  };
}

const orderInclude = {
  items: true,
  confirmedBy: { select: { name: true } },
  customer: { select: { name: true, email: true } },
} as const;

export class PrismaOrderRepository implements OrderRepositoryPort {
  async createOrder(
    input: OrderCreateInput
  ): Promise<{ ok: true; order: OrderEntity } | { ok: false; message: string }> {
    return prisma.$transaction(async (tx) => {
      for (const effect of input.stockEffects) {
        const product = await tx.product.findUnique({
          where: { id: effect.productId },
          select: { id: true, stock: true },
        });
        if (!product) return { ok: false as const, message: "Producto no encontrado" };
        if (product.stock < effect.quantity) {
          return {
            ok: false as const,
            message: `Stock insuficiente para uno de los artículos del pedido`,
          };
        }
      }

      for (const effect of input.stockEffects) {
        await tx.product.update({
          where: { id: effect.productId },
          data: { stock: { decrement: effect.quantity } },
        });
      }

      const order = await tx.order.create({
        data: {
          customerId: input.customerId,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          customerEmail: input.customerEmail,
          note: input.note,
          currency: input.currency,
          subtotal: input.subtotal,
          total: input.total,
          status: "pending",
          items: {
            create: input.items.map((i) => ({
              kind: i.kind,
              productId: i.productId,
              comboId: i.comboId,
              name: i.name,
              unitPrice: i.unitPrice,
              quantity: i.quantity,
              currency: i.currency,
            })),
          },
        },
        include: orderInclude,
      });

      return { ok: true as const, order: toEntity(order) };
    });
  }

  async findAll(options?: { limit?: number; status?: OrderStatus }): Promise<OrderEntity[]> {
    const orders = await prisma.order.findMany({
      where: options?.status ? { status: options.status } : undefined,
      include: orderInclude,
      orderBy: { createdAt: "desc" },
      take: options?.limit,
    });
    return orders.map(toEntity);
  }

  async findById(id: string): Promise<OrderEntity | null> {
    const order = await prisma.order.findUnique({ where: { id }, include: orderInclude });
    return order ? toEntity(order) : null;
  }

  async countPending(): Promise<number> {
    return prisma.order.count({ where: { status: "pending" } });
  }

  async setStatus(
    id: string,
    status: OrderStatus,
    confirmedById?: string | null
  ): Promise<{ ok: true; order: OrderEntity } | { ok: false; message: string }> {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });
      if (!order) return { ok: false as const, message: "Pedido no encontrado" };
      if (order.status === "cancelled") {
        return { ok: false as const, message: "Un pedido cancelado no puede cambiar de estado" };
      }
      if (order.status === status) {
        return { ok: false as const, message: "El pedido ya tiene ese estado" };
      }
      if (order.status !== "pending") {
        return { ok: false as const, message: "Solo se pueden gestionar pedidos pendientes" };
      }

      if (status === "cancelled") {
        for (const item of order.items) {
          if (item.kind === "product" && item.productId) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
          } else if (item.kind === "combo" && item.comboId) {
            const combo = await tx.combo.findUnique({
              where: { id: item.comboId },
              include: { items: { select: { productId: true, quantity: true } } },
            });
            if (!combo) continue;
            for (const ci of combo.items) {
              await tx.product.update({
                where: { id: ci.productId },
                data: { stock: { increment: ci.quantity * item.quantity } },
              });
            }
          }
        }
      }

      const updated = await tx.order.update({
        where: { id },
        data: { status, confirmedById: confirmedById ?? null },
        include: orderInclude,
      });

      return { ok: true as const, order: toEntity(updated) };
    });
  }
}

export const orderRepository: OrderRepositoryPort = new PrismaOrderRepository();
