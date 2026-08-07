import type { Session } from "next-auth";

export function isAdmin(session: Session | null): boolean {
  return session?.user?.role === "admin";
}

export function isStaff(session: Session | null): boolean {
  const role = session?.user?.role;
  return role === "admin" || role === "gestor";
}

export function canManage(session: Session | null): boolean {
  return isStaff(session);
}

export function isActiveUser(session: Session | null): boolean {
  return session?.user?.status === "active";
}

export function currentUserId(session: Session | null): string | undefined {
  return session?.user?.id;
}
