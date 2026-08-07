"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { checkAccountStatusAction } from "@/server/application/register-actions";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "");
    const result = await signIn("credentials", {
      email,
      password: formData.get("password"),
      redirect: false,
    });
    if (result?.error) {
      const status = await checkAccountStatusAction(email);
      if (status === "pending") {
        setError("Tu cuenta está pendiente de activación por el administrador.");
      } else if (status === "disabled") {
        setError("Tu cuenta está desactivada. Contacta al administrador.");
      } else {
        setError("Credenciales incorrectas");
      }
      setLoading(false);
      return;
    }
    setLoading(false);
    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="admin@cesarfashion.com" required autoComplete="email" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input id="password" name="password" type="password" placeholder="••••••••" required autoComplete="current-password" />
      </div>
      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" disabled={loading} className="mt-2 w-full">
        {loading && <Loader2 className="animate-spin" />}
        {loading ? "Iniciando sesión…" : "Iniciar sesión"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        ¿No tienes cuenta?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Crea una
        </Link>
      </p>
    </form>
  );
}
