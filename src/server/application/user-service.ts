import { revalidatePath } from "next/cache";
import { hashPassword } from "@/lib/password";
import { userInputSchema, type UserInputSchema } from "@/server/domain/user-schema";
import type { ActionResult } from "@/server/domain/user-schema";
import type { UserEntity } from "@/server/domain/user";
import type { UserRepositoryPort } from "@/server/domain/repositories";
import { userRepository } from "@/server/infrastructure/prisma-user-repository";

export interface UserService {
  listUsers(): Promise<UserEntity[]>;
  getUser(id: string): Promise<UserEntity | null>;
  createUser(input: unknown): Promise<ActionResult>;
  updateUser(id: string, input: unknown): Promise<ActionResult>;
  deleteUser(id: string, currentUserId: string): Promise<ActionResult>;
}

export function createUserService(repo: UserRepositoryPort): UserService {
  const parse = (raw: unknown, opts?: { requirePassword?: boolean }) => {
    const result = userInputSchema.safeParse(raw);
    if (!result.success) {
      return { ok: false as const, message: "Datos inválidos", fieldErrors: result.error.flatten().fieldErrors };
    }
    const data = result.data as UserInputSchema;
    if (opts?.requirePassword && !data.password) {
      return {
        ok: false as const,
        message: "Datos inválidos",
        fieldErrors: { password: ["La contraseña es obligatoria"] },
      };
    }
    return { ok: true as const, data };
  };

  return {
    async listUsers() {
      return repo.findAll();
    },

    async getUser(id) {
      return repo.findById(id);
    },

    async createUser(raw) {
      const parsed = parse(raw, { requirePassword: true });
      if (!parsed.ok) return parsed;
      const data = parsed.data;

      const existing = await repo.findByEmail(data.email);
      if (existing) {
        return { ok: false, message: "Ya existe un usuario con ese email", fieldErrors: { email: ["Email ya registrado"] } };
      }

      const passwordHash = await hashPassword(data.password ?? "");
      await repo.create({ ...data, password: passwordHash });
      revalidatePath("/admin/usuarios");
      return { ok: true, message: "Usuario creado correctamente" };
    },

    async updateUser(id, raw) {
      const parsed = parse(raw);
      if (!parsed.ok) return parsed;
      const data = parsed.data;

      const current = await repo.findById(id);
      if (!current) return { ok: false, message: "Usuario no encontrado" };

      const otherWithEmail = await repo.findByEmail(data.email);
      if (otherWithEmail && otherWithEmail.id !== id) {
        return { ok: false, message: "Ya existe un usuario con ese email", fieldErrors: { email: ["Email ya registrado"] } };
      }

      const patch: Partial<{ name: string | null; email: string; role: string; password: string }> = {
        name: data.name ?? null,
        email: data.email,
        role: data.role,
      };
      if (data.password) {
        patch.password = await hashPassword(data.password);
      }

      await repo.update(id, patch);
      revalidatePath("/admin/usuarios");
      return { ok: true, message: "Usuario actualizado correctamente" };
    },

    async deleteUser(id, currentUserId) {
      if (id === currentUserId) {
        return { ok: false, message: "No puedes eliminar tu propia cuenta" };
      }

      const target = await repo.findById(id);
      if (!target) return { ok: false, message: "Usuario no encontrado" };

      if (target.role === "admin") {
        const admins = await repo.findAll();
        const adminCount = admins.filter((u) => u.role === "admin").length;
        if (adminCount <= 1) {
          return { ok: false, message: "No puedes eliminar al último administrador" };
        }
      }

      const ok = await repo.delete(id);
      revalidatePath("/admin/usuarios");
      return ok ? { ok: true, message: "Usuario eliminado" } : { ok: false, message: "No se pudo eliminar el usuario" };
    },
  };
}

export const userService = createUserService(userRepository);
