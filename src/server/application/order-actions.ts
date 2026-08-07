"use server";

import { auth } from "@/auth";
import { orderService, type OrderActionResult } from "@/server/application/order-service";
import { canManage, currentUserId, isActiveUser } from "@/server/application/roles";
import type { ActionResult } from "@/server/domain/product-schema";

export async function createOrderAction(
  cart: unknown,
  customer: unknown
): Promise<OrderActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, message: "Inicia sesión para finalizar tu pedido", code: "UNAUTHENTICATED" };
  }
  if (!isActiveUser(session)) {
    return { ok: false, message: "Tu cuenta está pendiente de activación", code: "INACTIVE" };
  }
  return orderService.createOrder(cart, customer, { customerId: session.user.id });
}

export async function markOrderPaidAction(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!canManage(session)) return { ok: false, message: "No autorizado" };
  const id = formData.get("id") as string;
  if (!id) return { ok: false, message: "Falta el id del pedido" };
  return orderService.setStatus(id, "paid", currentUserId(session) ?? null);
}

export async function cancelOrderAction(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!canManage(session)) return { ok: false, message: "No autorizado" };
  const id = formData.get("id") as string;
  if (!id) return { ok: false, message: "Falta el id del pedido" };
  return orderService.setStatus(id, "cancelled", currentUserId(session) ?? null);
}
