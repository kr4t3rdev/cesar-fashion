import type { DefaultSession } from "next-auth";
import type { UserStatus } from "@/server/domain/user";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      role?: string;
      status?: UserStatus;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
    status?: UserStatus;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    status?: UserStatus;
  }
}
