import Link from "next/link";
import { ArrowRight, Clock3, ShoppingBag } from "lucide-react";

export function CheckoutGate({ status }: { status: "guest" | "pending" | "disabled" }) {
  const isPending = status === "pending";
  const isDisabled = status === "disabled";

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <div className="flex size-16 items-center justify-center rounded-full bg-secondary">
        {isPending || isDisabled ? (
          <Clock3 className="size-9 text-muted-foreground" />
        ) : (
          <ShoppingBag className="size-9 text-muted-foreground" />
        )}
      </div>

      <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        {isPending
          ? "Tu cuenta está en espera"
          : isDisabled
            ? "Tu cuenta está desactivada"
            : "Crea una cuenta para pedir"}
      </h1>

      <p className="mt-3 max-w-md text-muted-foreground">
        {isPending || isDisabled
          ? "Antes de finalizar pedidos, el administrador debe activar tu cuenta. Mientras tanto, tu carrito se conserva."
          : "Para finalizar tu pedido necesitas una cuenta activa. Regístrate o inicia sesión; tu carrito se conserva."}
      </p>

      {isPending || isDisabled ? (
        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="rounded-md border border-input px-4 py-3 text-sm text-muted-foreground">
            Tu carrito sigue guardado:{" "}
            <span className="font-semibold text-foreground">
              podrás completar el pedido cuando tu cuenta esté activa.
            </span>
          </div>
          <Link
            href="/catalogo"
            className="inline-flex h-12 items-center gap-2 rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Seguir comprando <ArrowRight className="size-4" />
          </Link>
        </div>
      ) : (
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/register"
            className="inline-flex h-12 items-center gap-2 rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Crear cuenta <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex h-12 items-center rounded-md border border-input px-8 text-sm font-medium transition-colors hover:bg-secondary"
          >
            Iniciar sesión
          </Link>
        </div>
      )}
    </div>
  );
}
