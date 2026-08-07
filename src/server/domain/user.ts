export const USER_ROLES = ["admin", "gestor"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export interface UserEntity {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserInput {
  name?: string | null;
  email: string;
  password?: string | null;
  role: string;
}

export function isUserRole(value: string): value is UserRole {
  return (USER_ROLES as readonly string[]).includes(value);
}
