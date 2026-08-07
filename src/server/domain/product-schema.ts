import { z } from "zod";

const optionalString = z
  .string()
  .trim()
  .nullish()
  .transform((v) => (v === null || v === undefined || v === "" ? null : v));

export const productInputSchema = z
  .object({
    name: z.string().trim().min(1, "El nombre es obligatorio").max(120),
    description: z.string().trim().min(1, "La descripción es obligatoria").max(2000),
    category: z.string().trim().min(1, "Selecciona una categoría"),
    price: z.coerce.number().positive("El precio debe ser mayor a 0").max(1_000_000),
    salePrice: z.coerce
      .number()
      .nonnegative("El precio de oferta no puede ser negativo")
      .max(1_000_000)
      .optional()
      .nullable(),
    currency: z.string().trim().min(1).max(3).default("USD"),
    stock: z.coerce.number().int("El stock debe ser entero").nonnegative("El stock no puede ser negativo").max(1_000_000),
    imageUrl: optionalString,
    isOnSale: z.coerce.boolean().default(false),
    saleLabel: optionalString,
    featured: z.coerce.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.isOnSale) {
      if (data.salePrice === null || data.salePrice === undefined || data.salePrice <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["salePrice"],
          message: "Precio de oferta obligatorio si el producto está en oferta",
        });
      } else if (data.salePrice >= data.price) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["salePrice"],
          message: "El precio de oferta debe ser menor al precio regular",
        });
      }
    }
  });

export type ProductInputSchema = z.infer<typeof productInputSchema>;

export interface ActionResult {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
}
