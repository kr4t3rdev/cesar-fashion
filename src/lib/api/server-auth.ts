/**
 * Autenticación en Server Components (reemplaza auth() de NextAuth).
 * Lee la cookie HttpOnly `cesar_token` con cookies() y llama a /auth/me
 * del API Spring usando API_UPSTREAM (no hay proxy de cookies en fetch server-side).
 */
import { cookies } from "next/headers";
import { apiFetch } from "./client";
import type { AuthMe } from "./types";

const UPSTREAM = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8081";
export const TOKEN_COOKIE = "cesar_token";
export const API_UPSTREAM = UPSTREAM;

export interface AuthUser extends AuthMe {
  status: "active" | "pending" | "disabled";
}

export async function getServerUser(): Promise<AuthUser | null> {
  const token = (await cookies()).get(TOKEN_COOKIE)?.value;
  if (!token) return null;
  try {
    const body = await apiFetch<{ ok: boolean; user: AuthUser }>(`${UPSTREAM}/api/v1/auth/me`, {
      headers: { cookie: `${TOKEN_COOKIE}=${token}` },
      cache: "no-store",
    });
    return body.user ?? null;
  } catch {
    return null;
  }
}

export function isAdmin(user: AuthUser | null): boolean {
  return user?.role === "admin";
}

export function isStaff(user: AuthUser | null): boolean {
  return user?.role === "admin" || user?.role === "gestor";
}

export function isActiveUser(user: AuthUser | null): boolean {
  return user?.status === "active";
}