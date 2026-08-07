"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="inline-flex h-11 items-center gap-2 rounded-md border border-input px-4 text-sm font-medium transition-colors hover:bg-secondary"
    >
      <LogOut className="size-4" />
      Salir
    </button>
  );
}
