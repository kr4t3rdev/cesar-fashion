import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Crear cuenta — Cesar Fashion",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-display text-3xl font-semibold tracking-tight">
            Cesar Fashion <span className="text-accent">LLC</span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">Crea tu cuenta para finalizar pedidos</p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <RegisterForm />
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Tu cuenta debe ser activada por el administrador antes de poder pedir.
        </p>
      </div>
    </div>
  );
}
