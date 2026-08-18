"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerAction } from "@/lib/api/actions";
import { cn } from "@/lib/utils";

const initialState = { ok: false, message: "" };

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);
  const fieldErrors = (state as { fieldErrors?: Record<string, string[]> })?.fieldErrors;

  if (state.ok) {
    return (
      <div className="flex flex-col items-center py-6 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-success/10">
          <CheckCircle2 className="size-8 text-success" />
        </div>
        <h1 className="mt-4 font-display text-xl font-semibold">Cuenta creada</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Espera la activación del administrador. Te avisaremos por correo cuando tu cuenta esté lista para pedir.
        </p>
        <Link href="/login" className="mt-6 text-sm font-medium text-primary hover:underline">
          Ir a iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" name="name" placeholder="Nombre y apellido" required autoComplete="name" />
        {fieldErrors?.name && <p className="text-sm text-destructive">{fieldErrors.name[0]}</p>}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="tu@correo.com" required autoComplete="email" />
        {fieldErrors?.email && <p className="text-sm text-destructive">{fieldErrors.email[0]}</p>}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input id="password" name="password" type="password" placeholder="Mínimo 6 caracteres" required autoComplete="new-password" />
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
      <Button type="submit" disabled={pending} className="mt-2 w-full">
        {pending ? <Loader2 className="animate-spin" /> : <UserPlus className="size-4" />}
        {pending ? "Creando cuenta…" : "Crear cuenta"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
