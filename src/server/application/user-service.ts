import { revalidatePath } from "next/cache";
import { hashPassword } from "@/lib/password";
import { userInputSchema, type UserInputSchema } from "@/server/domain/user-schema";
import { registerInputSchema } from "@/server/domain/register-schema";
import type { ActionResult } from "@/server/domain/user-schema";
import type { UserEntity, UserStatus } from "@/server/domain/user";
import type { UserRepositoryPort } from "@/server/domain/repositories";
import { userRepository } from "@/server/infrastructure/prisma-user-repository";

export interface UserService {
  listUsers(): Promise<UserEntity[]>;
  getUser(id: string): Promise<UserEntity | null>;
  createUser(input: unknown): Promise<ActionResult>;
  updateUser(id: string, input: unknown, currentUserId?: string): Promise<ActionResult>;
  changePassword(id: string, password: string): Promise<ActionResult>;
  deleteUser(id: string, currentUserId: string): Promise<ActionResult>;
  registerUser(input: unknown): Promise<ActionResult>;
  setUserStatus(id: string, status: UserStatus): Promise<ActionResult>;
  findByEmailWithStatus(email: string): Promise<UserEntity | null>;
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
      await repo.create({ ...data, password: passwordHash, status: data.status ?? "active" });
      revalidatePath("/admin/usuarios");
      return { ok: true, message: "Usuario creado correctamente" };
    },

    async updateUser(id, raw, currentUserId) {
      const parsed = parse(raw);
      if (!parsed.ok) return parsed;
      const data = parsed.data;

      const current = await repo.findById(id);
      if (!current) return { ok: false, message: "Usuario no encontrado" };

      if (id === currentUserId && current.role === "admin" && data.role !== "admin") {
        return {
          ok: false,
          message: "No puedes cambiar tu propio rol de administrador",
          fieldErrors: { role: ["No puedes quitarte el rol de administrador a ti mismo"] },
        };
      }

      const otherWithEmail = await repo.findByEmail(data.email);
      if (otherWithEmail && otherWithEmail.id !== id) {
        return { ok: false, message: "Ya existe un usuario con ese email", fieldErrors: { email: ["Email ya registrado"] } };
      }

      const patch: Partial<{ name: string | null; email: string; role: string; password: string; status: UserStatus }> = {
        name: data.name ?? null,
        email: data.email,
        role: data.role,
        status: data.status,
      };
      if (data.password) {
        patch.password = await hashPassword(data.password);
      }

      await repo.update(id, patch);
      revalidatePath("/admin/usuarios");
      return { ok: true, message: "Usuario actualizado correctamente" };
    },

    async changePassword(id, password) {
      const current = await repo.findById(id);
      if (!current) return { ok: false, message: "Usuario no encontrado" };

      const passwordHash = await hashPassword(password);
      await repo.update(id, { password: passwordHash });
      revalidatePath("/admin/usuarios");
      return { ok: true, message: "Contraseña actualizada correctamente" };
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

    async registerUser(raw) {
      const result = registerInputSchema.safeParse(raw);
      if (!result.success) {
        return { ok: false, message: "Revisa tus datos", fieldErrors: result.error.flatten().fieldErrors };
      }
      const data = result.data;

      const existing = await repo.findByEmail(data.email);
      if (existing) {
        return { ok: true, message: "Cuenta creada. Espera la activación del administrador." };
      }

      const passwordHash = await hashPassword(data.password);
      try {
        await repo.create({
          name: data.name,
          email: data.email,
          password: passwordHash,
          role: "usuario",
          status: "pending",
        });
      } catch {
        return { ok: true, message: "Cuenta creada. Espera la activación del administrador." };
      }
      return { ok: true, message: "Cuenta creada. Espera la activación del administrador." };
    },

    async setUserStatus(id, status) {
      const current = await repo.findById(id);
      if (!current) return { ok: false, message: "Usuario no encontrado" };
      if (current.role === "admin" && status !== "active") {
        return { ok: false, message: "No puedes desactivar una cuenta de administrador" };
      }
      const updated = await repo.setStatus(id, status);
      if (!updated) return { ok: false, message: "No se pudo actualizar el estado" };
      revalidatePath("/admin/usuarios");
      const label = status === "active" ? "activada" : status === "disabled" ? "desactivada" : "puesta en espera";
      return { ok: true, message: `Cuenta de ${updated.name ?? updated.email} ${label}` };
    },

    async findByEmailWithStatus(email) {
      return repo.findByEmailWithStatus(email);
    },
  };
}

export const userService = createUserService(userRepository);
