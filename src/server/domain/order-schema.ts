import { z } from "zod";

export const orderInputSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, "Escribe tu nombre")
    .max(120, "El nombre es demasiado largo"),
  customerPhone: z
    .string()
    .trim()
    .max(40, "El teléfono es demasiado largo")
    .nullish()
    .transform((v) => (v === null || v === undefined || v === "" ? null : v)),
  customerEmail: z
    .string()
    .trim()
    .max(200)
    .nullish()
    .transform((v) => (v === null || v === undefined || v === "" ? null : v)),
  note: z
    .string()
    .trim()
    .max(1000, "La nota es demasiado larga")
    .nullish()
    .transform((v) => (v === null || v === undefined || v === "" ? null : v)),
});

export type OrderInputSchema = z.infer<typeof orderInputSchema>;

export const cartLineSchema = z.object({
  kind: z.enum(["product", "combo"]),
  id: z.string().min(1, "Falta el identificador del artículo"),
  quantity: z.coerce.number().int("Debe ser entero").min(1, "La cantidad debe ser al menos 1").max(999, "Máximo 999 unidades"),
});

export type CartLineSchema = z.infer<typeof cartLineSchema>;
