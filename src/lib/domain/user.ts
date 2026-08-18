export const USER_ROLES = ["admin", "gestor", "usuario"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = ["pending", "active", "disabled"] as const;

export type UserStatus = (typeof USER_STATUSES)[number];

export interface UserEntity {
  id: string;
  name: string | null;
  email: string;
  role: string;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserInput {
  name?: string | null;
  email: string;
  password?: string | null;
  role: string;
  status?: UserStatus;
}

export function isUserRole(value: string): value is UserRole {
  return (USER_ROLES as readonly string[]).includes(value);
}

export function isUserStatus(value: string): value is UserStatus {
  return (USER_STATUSES as readonly string[]).includes(value);
}