"use server";

import { auth } from "@/auth";
import { userService } from "@/server/application/user-service";
import { isAdmin, currentUserId } from "@/server/application/roles";

export async function createUserAction(_prevState: unknown, formData: FormData) {
  const session = await auth();
  if (!isAdmin(session)) return { ok: false, message: "No autorizado" };
  return userService.createUser({
    name: formData.get("name") ?? "",
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });
}

export async function updateUserAction(_prevState: unknown, formData: FormData) {
  const session = await auth();
  if (!isAdmin(session)) return { ok: false, message: "No autorizado" };
  const id = formData.get("id") as string;
  if (!id) return { ok: false, message: "Falta el id del usuario" };
  return userService.updateUser(id, {
    name: formData.get("name") ?? "",
    email: formData.get("email"),
    password: formData.get("password") ?? "",
    role: formData.get("role"),
  });
}

export async function deleteUserAction(formData: FormData) {
  const session = await auth();
  if (!isAdmin(session)) return { ok: false, message: "No autorizado" };
  const id = formData.get("id") as string;
  if (!id) return { ok: false, message: "Falta el id del usuario" };
  return userService.deleteUser(id, currentUserId(session) ?? "");
}
