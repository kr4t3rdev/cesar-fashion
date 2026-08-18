"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateUserAction } from "@/lib/api/actions";
import type { UserEntity } from "@/lib/domain/user";
import { cn } from "@/lib/utils";

const initialState = { ok: false, message: "" };

export function EditUserForm({ user, onDone }: { user: UserEntity; onDone?: () => void }) {
  const [state, formAction, pending] = useActionState(updateUserAction, initialState);
  const fieldErrors = (state as { fieldErrors?: Record<string, string[]> })?.fieldErrors;
  const router = useRouter();

  useEffect(() => {
    if (state.ok) {
      router.refresh();
      onDone?.();
    }
  }, [state.ok, onDone, router]);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="id" value={user.id} />
      <div className="grid gap-2">
        <Label htmlFor={`edit-name-${user.id}`}>Nombre</Label>
        <Input id={`edit-name-${user.id}`} name="name" defaultValue={user.name ?? ""} />
        {fieldErrors?.name && <p className="text-sm text-destructive">{fieldErrors.name[0]}</p>}
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`edit-email-${user.id}`}>Email</Label>
        <Input id={`edit-email-${user.id}`} name="email" type="email" defaultValue={user.email} required />
        {fieldErrors?.email && <p className="text-sm text-destructive">{fieldErrors.email[0]}</p>}
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`edit-role-${user.id}`}>Rol</Label>
        <select
          id={`edit-role-${user.id}`}
          name="role"
          defaultValue={user.role}
          className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        >
          <option value="gestor">Gestor</option>
          <option value="admin">Admin</option>
          <option value="usuario">Cliente</option>
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
        {pending ? <Loader2 className="animate-spin" /> : <Save className="size-4" />}
        {pending ? "Guardando…" : "Guardar cambios"}
      </Button>
    </form>
  );
}
