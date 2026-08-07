"use server";

import { auth } from "@/auth";
import { comboService } from "@/server/application/combo-service";
import { canManage } from "@/server/application/roles";

export async function createComboAction(_prevState: unknown, formData: FormData) {
  const session = await auth();
  if (!canManage(session)) return { ok: false, message: "No autorizado" };

  const rawItems = formData.getAll("productId") as string[];
  const rawQuantities = formData.getAll("quantity") as string[];
  const items = rawItems.map((productId, index) => ({ productId, quantity: rawQuantities[index] ?? "1" }));

  return comboService.createCombo({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    salePrice: formData.get("salePrice") ?? "",
    currency: formData.get("currency") ?? "USD",
    imageUrl: formData.get("imageUrl") ?? "",
    isOnSale: formData.get("isOnSale"),
    saleLabel: formData.get("saleLabel") ?? "",
    featured: formData.get("featured"),
    items,
  });
}

export async function updateComboAction(_prevState: unknown, formData: FormData) {
  const session = await auth();
  if (!canManage(session)) return { ok: false, message: "No autorizado" };
  const id = formData.get("id") as string;
  if (!id) return { ok: false, message: "Falta el id del combo" };

  const rawItems = formData.getAll("productId") as string[];
  const rawQuantities = formData.getAll("quantity") as string[];
  const items = rawItems.map((productId, index) => ({ productId, quantity: rawQuantities[index] ?? "1" }));

  return comboService.updateCombo(id, {
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    salePrice: formData.get("salePrice") ?? "",
    currency: formData.get("currency") ?? "USD",
    imageUrl: formData.get("imageUrl") ?? "",
    isOnSale: formData.get("isOnSale"),
    saleLabel: formData.get("saleLabel") ?? "",
    featured: formData.get("featured"),
    items,
  });
}

export async function toggleComboAction(formData: FormData) {
  const session = await auth();
  if (!canManage(session)) return { ok: false, message: "No autorizado" };
  const id = formData.get("id") as string;
  if (!id) return { ok: false, message: "Falta el id del combo" };
  return comboService.toggleActive(id);
}

export async function deleteComboAction(formData: FormData) {
  const session = await auth();
  if (!canManage(session)) return { ok: false, message: "No autorizado" };
  const id = formData.get("id") as string;
  if (!id) return { ok: false, message: "Falta el id del combo" };
  return comboService.deleteCombo(id);
}
