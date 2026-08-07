"use server";

import { auth } from "@/auth";
import { productService } from "@/server/application/product-service";

function isAdmin(session: { user?: { role?: string } } | null): boolean {
  return session?.user?.role === "admin";
}

export async function createProductAction(_prevState: unknown, formData: FormData) {
  const session = await auth();
  if (!isAdmin(session)) {
    return { ok: false, message: "No autorizado" };
  }
  return productService.createProduct(formData);
}

export async function updateProductAction(_prevState: unknown, formData: FormData) {
  const session = await auth();
  if (!isAdmin(session)) {
    return { ok: false, message: "No autorizado" };
  }
  const id = formData.get("id") as string;
  if (!id) return { ok: false, message: "Falta el id del producto" };
  return productService.updateProduct(id, formData);
}

export async function toggleSaleAction(formData: FormData) {
  const session = await auth();
  if (!isAdmin(session)) {
    return { ok: false, message: "No autorizado" };
  }
  const id = formData.get("id") as string;
  if (!id) return { ok: false, message: "Falta el id del producto" };
  return productService.toggleSale(id);
}

export async function deleteProductAction(formData: FormData) {
  const session = await auth();
  if (!isAdmin(session)) {
    return { ok: false, message: "No autorizado" };
  }
  const id = formData.get("id") as string;
  if (!id) return { ok: false, message: "Falta el id del producto" };
  return productService.deleteProduct(id);
}
