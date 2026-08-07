import { z } from "zod";

export const registerInputSchema = z.object({
  name: z.string().trim().min(2, "Escribe tu nombre").max(120, "El nombre es demasiado largo"),
  email: z.string().trim().email("El email no es válido").max(200),
  password: z
    .string()
    .trim()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(200, "La contraseña es demasiado larga"),
});

export type RegisterInputSchema = z.infer<typeof registerInputSchema>;
