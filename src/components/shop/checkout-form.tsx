"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Loader2, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/shop/cart/cart-context";
import { createOrderAction } from "@/server/application/order-actions";
import { CheckoutGate } from "@/components/shop/checkout-gate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";

const FALLBACK_IMAGE = "/placeholder-product.svg";

export function CheckoutForm() {
  const { items, subtotal, clearCart } = useCart();
  const [pending, startTransition] = useTransition();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [note, setNote] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [confirmed, setConfirmed] = useState<{ reference: string } | null>(null);
  const [gate, setGate] = useState<"guest" | "pending" | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    startTransition(async () => {
      const result = await createOrderAction(
        items.map((i) => ({ kind: i.kind, id: i.id, quantity: i.quantity })),
        { customerName, customerPhone, customerEmail, note }
      );

      if (result.code === "UNAUTHENTICATED") {
        setGate("guest");
        return;
      }
      if (result.code === "INACTIVE") {
        setGate("pending");
        return;
      }

      if (!result.ok) {
        setError(result.message);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      clearCart();
      setConfirmed({ reference: result.reference ?? "" });
    });
  };

  if (gate) {
    return <CheckoutGate status={gate} />;
  }

  if (confirmed) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:px-6">
        <div className="flex size-16 items-center justify-center rounded-full bg-success/10">
          <CheckCircle2 className="size-9 text-success" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          ¡Pedido recibido!
        </h1>
        <p className="mt-3 text-muted-foreground">
          Tu referencia es <span className="font-semibold text-foreground">{confirmed.reference}</span>.
          En breve nos pondremos en contacto para coordinar la entrega y el pago.
        </p>
        <Link
          href="/catalogo"
          className="mt-8 inline-flex h-12 items-center gap-2 rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Seguir comprando <ArrowRight className="size-4" />
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:px-6">
        <ShoppingBag className="size-10 text-muted-foreground" />
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight">Tu carrito está vacío</h1>
        <p className="mt-2 text-muted-foreground">Añade piezas del catálogo antes de finalizar tu pedido.</p>
        <Link
          href="/catalogo"
          className="mt-8 inline-flex h-12 items-center gap-2 rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Explorar catálogo <ArrowRight className="size-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Checkout</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Finalizar pedido</h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          Cuéntanos cómo contactarte. Coordinaremos la entrega y el pago contigo directamente.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_400px] lg:items-start">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-display text-lg font-semibold">Tus datos</h2>
            <div className="mt-5 flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="checkout-name">Nombre completo *</Label>
                <Input
                  id="checkout-name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ej. María Fernández"
                  required
                />
                {fieldErrors?.customerName && (
                  <p className="text-sm text-destructive">{fieldErrors.customerName[0]}</p>
                )}
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="checkout-phone">Teléfono</Label>
                  <Input
                    id="checkout-phone"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="809-000-0000"
                  />
                  {fieldErrors?.customerPhone && (
                    <p className="text-sm text-destructive">{fieldErrors.customerPhone[0]}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="checkout-email">Email</Label>
                  <Input
                    id="checkout-email"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="tu@correo.com"
                  />
                  {fieldErrors?.customerEmail && (
                    <p className="text-sm text-destructive">{fieldErrors.customerEmail[0]}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="checkout-note">Nota (opcional)</Label>
                <Textarea
                  id="checkout-note"
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Talla, dirección, horario de entrega…"
                />
                {fieldErrors?.note && <p className="text-sm text-destructive">{fieldErrors.note[0]}</p>}
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button type="submit" disabled={pending} className="h-12 w-full text-sm">
            {pending ? <Loader2 className="animate-spin" /> : <CheckCircle2 className="size-4" />}
            {pending ? "Enviando pedido…" : "Confirmar pedido"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Al confirmar reservamos el stock por 24 horas mientras coordinamos el pago.
          </p>
        </form>

        <aside className="rounded-xl border bg-card p-6">
          <h2 className="font-display text-lg font-semibold">Resumen</h2>
          <ul className="mt-5 flex flex-col gap-4">
            {items.map((item) => (
              <li key={item.key} className="flex gap-3">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-secondary">
                  <Image
                    src={item.imageUrl ?? FALLBACK_IMAGE}
                    alt={item.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col">
                  <p className="text-sm leading-snug font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">× {item.quantity}</p>
                </div>
                <span className="text-sm font-semibold">
                  {formatCurrency(item.unitPrice * item.quantity, item.currency)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex items-center justify-between border-t pt-4">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="font-display text-xl font-semibold">
              {formatCurrency(subtotal, items[0]?.currency ?? "USD")}
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}
