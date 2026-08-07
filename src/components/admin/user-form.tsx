"use client";

import { useActionState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createUserAction } from "@/server/application/user-actions";
import { USER_ROLES } from "@/server/domain/user";
import { cn } from "@/lib/utils";

const initialState = { ok: false, message: "" };

export function UserForm() {
  const [state, formAction, pending] = useActionState(createUserAction, initialState);
  const fieldErrors = (state as { fieldErrors?: Record<string, string[]> })?.fieldErrors;

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="grid gap-2">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" name="name" placeholder="Nombre y apellido" />
        {fieldErrors?.name && <p className="text-sm text-destructive">{fieldErrors.name[0]}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="usuario@cesarfashion.com" required />
        {fieldErrors?.email && <p className="text-sm text-destructive">{fieldErrors.email[0]}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input id="password" name="password" type="password" placeholder="Mínimo 6 caracteres" required />
        {fieldErrors?.password && <p className="text-sm text-destructive">{fieldErrors.password[0]}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="role">Rol</Label>
        <select
          id="role"
          name="role"
          defaultValue="gestor"
          className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        >
          <option value="gestor">Gestor</option>
          <option value="admin">Admin</option>
        </select>
        {fieldErrors?.role && <p className="text-sm text-destructive">{fieldErrors.role[0]}</p>}
      </div>

      {state.message && (
        <div
          className={cn(
            "rounded-md border px-3 py-2 text-sm",
            state.ok
              ? "border-success/30 bg-success/10 text-success"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          )}
        >
          {state.message}
        </div>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? <Loader2 className="animate-spin" /> : <UserPlus className="size-4" />}
        {pending ? "Creando…" : "Crear usuario"}
      </Button>
    </form>
  );
}

export const USER_ROLES_LABELS: Record<(typeof USER_ROLES)[number], string> = {
  admin: "Admin",
  gestor: "Gestor",
};
