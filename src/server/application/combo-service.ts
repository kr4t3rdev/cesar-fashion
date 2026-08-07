import { revalidatePath } from "next/cache";
import { comboInputSchema, type ComboInputSchema } from "@/server/domain/combo-schema";
import type { ActionResult } from "@/server/domain/combo-schema";
import type { ComboEntity } from "@/server/domain/combo";
import type { ComboRepositoryPort } from "@/server/domain/repositories";
import { comboRepository } from "@/server/infrastructure/prisma-combo-repository";

export interface ComboService {
  listCombos(options?: { includeInactive?: boolean }): Promise<ComboEntity[]>;
  getCombo(id: string): Promise<ComboEntity | null>;
  createCombo(input: unknown): Promise<ActionResult>;
  updateCombo(id: string, input: unknown): Promise<ActionResult>;
  toggleActive(id: string): Promise<ActionResult>;
  deleteCombo(id: string): Promise<ActionResult>;
}

export function createComboService(repo: ComboRepositoryPort): ComboService {
  const parse = (raw: unknown) => {
    const result = comboInputSchema.safeParse(raw);
    if (!result.success) {
      return { ok: false as const, message: "Datos inválidos", fieldErrors: result.error.flatten().fieldErrors };
    }
    return { ok: true as const, data: result.data as ComboInputSchema };
  };

  return {
    async listCombos(options) {
      return repo.findAll(options);
    },

    async getCombo(id) {
      return repo.findById(id);
    },

    async createCombo(raw) {
      const parsed = parse(raw);
      if (!parsed.ok) return parsed;
      const data = parsed.data;

      await repo.create({
        name: data.name,
        description: data.description,
        price: data.price,
        salePrice: data.salePrice,
        currency: data.currency,
        imageUrl: data.imageUrl,
        isOnSale: data.isOnSale,
        saleLabel: data.saleLabel,
        featured: data.featured,
        items: data.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      });
      revalidatePath("/");
      revalidatePath("/combos");
      revalidatePath("/admin/combos");
      return { ok: true, message: "Combo creado correctamente" };
    },

    async updateCombo(id, raw) {
      const parsed = parse(raw);
      if (!parsed.ok) return parsed;
      const data = parsed.data;

      await repo.update(id, {
        name: data.name,
        description: data.description,
        price: data.price,
        salePrice: data.salePrice,
        currency: data.currency,
        imageUrl: data.imageUrl,
        isOnSale: data.isOnSale,
        saleLabel: data.saleLabel,
        featured: data.featured,
        items: data.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      });
      revalidatePath("/");
      revalidatePath("/combos");
      revalidatePath("/admin/combos");
      return { ok: true, message: "Combo actualizado correctamente" };
    },

    async toggleActive(id) {
      const combo = await repo.findById(id);
      if (!combo) return { ok: false, message: "Combo no encontrado" };
      const next = !combo.isActive;
      await repo.update(id, { isActive: next });
      revalidatePath("/");
      revalidatePath("/combos");
      revalidatePath("/admin/combos");
      return { ok: true, message: next ? "Combo activado" : "Combo desactivado" };
    },

    async deleteCombo(id) {
      const ok = await repo.delete(id);
      revalidatePath("/");
      revalidatePath("/combos");
      revalidatePath("/admin/combos");
      return ok ? { ok: true, message: "Combo eliminado" } : { ok: false, message: "No se pudo eliminar el combo" };
    },
  };
}

export const comboService = createComboService(comboRepository);
