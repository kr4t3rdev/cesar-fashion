"use client";

import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={async () => {
        await authApi.logout();
        router.push("/");
        router.refresh();
      }}
      className="inline-flex h-11 items-center gap-2 rounded-md border border-input px-4 text-sm font-medium transition-colors hover:bg-secondary"
    >
      <LogOut className="size-4" />
      Salir
    </button>
  );
}