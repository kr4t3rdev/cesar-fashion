/**
 * Lecturas autenticadas para Server Components (reemplazan los services de
 * Prisma: listUsers, listOrders, pendingCount). Publican los mismos shapes que
 * los services para no tocar los componentes: adapters convierten la respuesta
 * del API al tipo de dominio (src/lib/domain/*).
 */
import { cookies } from "next/headers";
import { apiFetch } from "./client";
import { API_UPSTREAM, TOKEN_COOKIE } from "./server-auth";
import type { Order, User } from "./types";
import type { OrderEntity, OrderStatus } from "@/lib/domain/order";
import type { UserEntity } from "@/lib/domain/user";
import { orderFromApi, userFromApi } from "./adapters";

async function authedGet<T>(path: string): Promise<T> {
  const token = (await cookies()).get(TOKEN_COOKIE)?.value;
  const headers: HeadersInit = {};
  if (token) headers.cookie = `${TOKEN_COOKIE}=${token}`;
  return apiFetch<T>(`${API_UPSTREAM}${path}`, { headers });
}

export async function listUsersFromApi(): Promise<UserEntity[]> {
  const users = await authedGet<User[]>("/api/v1/users");
  return users.map(userFromApi);
}

export async function listOrdersFromApi(options: { status?: OrderStatus; limit?: number } = {}): Promise<OrderEntity[]> {
  const params = new URLSearchParams();
  if (options.status) params.set("status", options.status);
  if (options.limit) params.set("limit", String(options.limit));
  const qs = params.toString();
  const orders = await authedGet<Order[]>(`/api/v1/orders${qs ? `?${qs}` : ""}`);
  return orders.map(orderFromApi);
}

export async function pendingOrdersCount(): Promise<number> {
  return authedGet<number>("/api/v1/orders/pending-count");
}