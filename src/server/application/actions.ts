"use server";

import { auth } from "@/auth";
import { productService } from "@/server/application/product-service";
import { canManage } from "@/server/application/roles";

export async function createProductAction(_prevState: unknown, formData: FormData) {
  const session = await auth();
  if (!canManage(session)) {
    return { ok: false, message: "No autorizado" };
  }
  return productService.createProduct(Object.fromEntries(formData));
}

export async function updateProductAction(_prevState: unknown, formData: FormData) {
  const session = await auth();
  if (!canManage(session)) {
    return { ok: false, message: "No autorizado" };
  }
  const id = formData.get("id") as string;
  if (!id) return { ok: false, message: "Falta el id del producto" };
  return productService.updateProduct(id, Object.fromEntries(formData));
}

export async function toggleSaleAction(formData: FormData) {
  const session = await auth();
  if (!canManage(session)) {
    return { ok: false, message: "No autorizado" };
  }
  const id = formData.get("id") as string;
  if (!id) return { ok: false, message: "Falta el id del producto" };
  return productService.toggleSale(id);
}

export async function deleteProductAction(formData: FormData) {
  const session = await auth();
  if (!canManage(session)) {
    return { ok: false, message: "No autorizado" };
  }
  const id = formData.get("id") as string;
  if (!id) return { ok: false, message: "Falta el id del producto" };
  return productService.deleteProduct(id);
}
