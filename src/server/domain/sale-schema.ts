import { z } from "zod";

export const saleInputSchema = z
  .object({
    productId: z.string().min(1, "Selecciona un producto"),
    unitName: z.string().trim().min(1, "El nombre de la unidad es obligatorio").max(120),
    piecesPerUnit: z.coerce.number().int("Debe ser entero").min(1, "Debe ser al menos 1").max(1_000_000),
    units: z.coerce.number().int("Debe ser entero").min(1, "Debe ser al menos 1").max(1_000_000),
    pricePerUnit: z.coerce.number().positive("El precio por unidad debe ser mayor a 0").max(1_000_000),
    customer: z.string().trim().max(200).nullish().transform((v) => (v === null || v === undefined || v === "" ? null : v)),
    note: z.string().trim().max(1000).nullish().transform((v) => (v === null || v === undefined || v === "" ? null : v)),
  })
  .superRefine((data, ctx) => {
    if (data.piecesPerUnit * data.units > 1_000_000) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["units"],
        message: "La cantidad total de piezas no puede superar 1,000,000",
      });
    }
  });

export type SaleInputSchema = z.infer<typeof saleInputSchema>;

export interface ActionResult {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
}
