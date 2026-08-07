import type { User as PrismaUser } from "@prisma/client";
import type { UserEntity, UserInput, UserStatus } from "@/server/domain/user";
import type { UserRepositoryPort } from "@/server/domain/repositories";
import { isUserStatus } from "@/server/domain/user";
import { prisma } from "./prisma";

function toEntity(u: PrismaUser): UserEntity {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: isUserStatus(u.status) ? u.status : "pending",
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

export class PrismaUserRepository implements UserRepositoryPort {
  async findAll(): Promise<UserEntity[]> {
    const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
    return users.map(toEntity);
  }

  async findById(id: string): Promise<UserEntity | null> {
    const u = await prisma.user.findUnique({ where: { id } });
    return u ? toEntity(u) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const u = await prisma.user.findUnique({ where: { email } });
    return u ? toEntity(u) : null;
  }

  async findByEmailWithStatus(email: string): Promise<UserEntity | null> {
    return this.findByEmail(email);
  }

  async create(input: UserInput): Promise<UserEntity> {
    const u = await prisma.user.create({
      data: {
        name: input.name ?? null,
        email: input.email,
        password: input.password ?? null,
        role: input.role,
        status: input.status ?? "active",
      },
    });
    return toEntity(u);
  }

  async update(id: string, input: Partial<UserInput>): Promise<UserEntity | null> {
    const u = await prisma.user
      .update({
        where: { id },
        data: {
          name: input.name === undefined ? undefined : input.name ?? null,
          email: input.email,
          role: input.role,
          status: input.status,
          password: input.password === undefined ? undefined : input.password ?? null,
        },
      })
      .catch(() => null);
    return u ? toEntity(u) : null;
  }

  async setStatus(id: string, status: UserStatus): Promise<UserEntity | null> {
    const u = await prisma.user
      .update({
        where: { id },
        data: { status },
      })
      .catch(() => null);
    return u ? toEntity(u) : null;
  }

  async delete(id: string): Promise<boolean> {
    return prisma.user
      .delete({ where: { id } })
      .then(() => true)
      .catch(() => false);
  }
}

export const userRepository: UserRepositoryPort = new PrismaUserRepository();
