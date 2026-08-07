import { z } from "zod";

export const comboItemInputSchema = z.object({
  productId: z.string().min(1, "Selecciona un producto"),
  quantity: z.coerce
    .number()
    .int("La cantidad debe ser entera")
    .min(1, "La cantidad debe ser al menos 1")
    .max(1_000_000),
});

export const comboInputSchema = z
  .object({
    name: z.string().trim().min(1, "El nombre es obligatorio").max(120),
    description: z.string().trim().min(1, "La descripción es obligatoria").max(2000),
    price: z.coerce.number().positive("El precio debe ser mayor a 0").max(1_000_000),
    salePrice: z.coerce
      .number()
      .nonnegative("El precio de oferta no puede ser negativo")
      .max(1_000_000)
      .optional()
      .nullable(),
    currency: z.string().trim().min(1).max(3).default("USD"),
    imageUrl: z.string().trim().nullish().transform((v) => (v === null || v === undefined || v === "" ? null : v)),
    isOnSale: z.coerce.boolean().default(false),
    saleLabel: z.string().trim().nullish().transform((v) => (v === null || v === undefined || v === "" ? null : v)),
    featured: z.coerce.boolean().default(false),
    items: z.array(comboItemInputSchema).min(1, "Agrega al menos un producto al combo"),
  })
  .superRefine((data, ctx) => {
    if (data.isOnSale) {
      if (data.salePrice === null || data.salePrice === undefined || data.salePrice <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["salePrice"],
          message: "Precio de oferta obligatorio si el combo está en oferta",
        });
      } else if (data.salePrice >= data.price) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["salePrice"],
          message: "El precio de oferta debe ser menor al precio regular",
        });
      }
    }
    const ids = data.items.map((i) => i.productId);
    if (new Set(ids).size !== ids.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["items"],
        message: "No puedes agregar el mismo producto dos veces al combo",
      });
    }
  });

export type ComboInputSchema = z.infer<typeof comboInputSchema>;

export interface ActionResult {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
}
