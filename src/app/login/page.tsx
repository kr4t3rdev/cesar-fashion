import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { getServerUser } from "@/lib/api/server-auth";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

export default async function LoginPage() {
  const user = await getServerUser();
  if (user) redirect(user.role === "usuario" ? "/" : "/admin");

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Volver a la tienda
        </Link>
        <div className="mb-8 text-center">
          <p className="font-display text-3xl font-semibold tracking-tight">
            Cesar Fashion <span className="text-accent">LLC</span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">Inicia sesión en tu cuenta</p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <LoginForm />
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          El acceso al panel de administración requiere una cuenta de gestor o administrador.
        </p>
      </div>
    </div>
  );
}
