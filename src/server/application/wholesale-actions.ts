"use server";

import { auth } from "@/auth";
import { wholesaleService } from "@/server/application/wholesale-service";
import { canManage, currentUserId } from "@/server/application/roles";

export async function registerWholesaleSaleAction(_prevState: unknown, formData: FormData) {
  const session = await auth();
  if (!canManage(session)) return { ok: false, message: "No autorizado" };
  return wholesaleService.registerSale(
    {
      productId: formData.get("productId"),
      unitName: formData.get("unitName"),
      piecesPerUnit: formData.get("piecesPerUnit"),
      units: formData.get("units"),
      pricePerUnit: formData.get("pricePerUnit"),
      customer: formData.get("customer") ?? "",
      note: formData.get("note") ?? "",
    },
    currentUserId(session) ?? null
  );
}
