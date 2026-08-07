import { z } from "zod";
import { USER_ROLES, USER_STATUSES } from "@/server/domain/user";

export const userInputSchema = z.object({
  name: z.string().trim().max(120).optional().nullable(),
  email: z.string().trim().email("El email no es válido").max(200),
  password: z
    .string()
    .trim()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(200)
    .optional()
    .nullable()
    .transform((v) => (v === "" ? undefined : v)),
  role: z.enum(USER_ROLES, { message: "Rol inválido" }),
  status: z.enum(USER_STATUSES, { message: "Estado inválido" }).optional(),
});

export type UserInputSchema = z.infer<typeof userInputSchema>;

export interface ActionResult {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
}
