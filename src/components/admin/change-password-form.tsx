"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePasswordAction } from "@/lib/api/actions";
import type { UserEntity } from "@/lib/domain/user";
import { cn } from "@/lib/utils";

const initialState = { ok: false, message: "" };

export function ChangePasswordForm({ user, onDone }: { user: UserEntity; onDone?: () => void }) {
  const [state, formAction, pending] = useActionState(changePasswordAction, initialState);
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
        <Label htmlFor={`new-password-${user.id}`}>Nueva contraseña</Label>
        <Input
          id={`new-password-${user.id}`}
          name="password"
          type="password"
          placeholder="Mínimo 6 caracteres"
          required
          autoComplete="new-password"
        />
        {fieldErrors?.password && <p className="text-sm text-destructive">{fieldErrors.password[0]}</p>}
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
        {pending ? <Loader2 className="animate-spin" /> : <KeyRound className="size-4" />}
        {pending ? "Guardando…" : "Cambiar contraseña"}
      </Button>
    </form>
  );
}
