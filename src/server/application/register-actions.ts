"use server";

import { z } from "zod";
import { userService } from "@/server/application/user-service";

const emailSchema = z.string().trim().email();

export async function registerAction(_prevState: unknown, formData: FormData) {
  return userService.registerUser({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
}

export async function checkAccountStatusAction(rawEmail: string): Promise<"pending" | "disabled" | "unknown"> {
  const parsed = emailSchema.safeParse(rawEmail);
  if (!parsed.success) return "unknown";
  const user = await userService.findByEmailWithStatus(parsed.data);
  if (user?.status === "pending" || user?.status === "disabled") return user.status;
  return "unknown";
}
