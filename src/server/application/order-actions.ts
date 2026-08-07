"use server";

import { auth } from "@/auth";
import { orderService, type OrderActionResult } from "@/server/application/order-service";
import { canManage, currentUserId } from "@/server/application/roles";
import type { ActionResult } from "@/server/domain/sale-schema";

export async function createOrderAction(
  cart: unknown,
  customer: unknown
): Promise<OrderActionResult> {
  return orderService.createOrder(cart, customer);
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
