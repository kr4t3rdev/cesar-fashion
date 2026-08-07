"use server";

import { auth } from "@/auth";
import { wholesaleService } from "@/server/application/wholesale-service";
import { canManage } from "@/server/application/roles";

export async function declareWholesaleProductAction(_prevState: unknown, formData: FormData) {
  const session = await auth();
  if (!canManage(session)) return { ok: false, message: "No autorizado" };

  return wholesaleService.declareProduct({
    productId: formData.get("productId"),
    wholesaleUnitName: formData.get("wholesaleUnitName"),
    wholesaleUnitQuantity: formData.get("wholesaleUnitQuantity"),
  });
}

export async function undeclareWholesaleProductAction(formData: FormData) {
  const session = await auth();
  if (!canManage(session)) return { ok: false, message: "No autorizado" };

  const id = formData.get("id") as string;
  if (!id) return { ok: false, message: "Falta el id del producto" };
  return wholesaleService.undeclareProduct(id);
}
