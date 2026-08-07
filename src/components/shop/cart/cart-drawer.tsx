"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "@/components/shop/cart/cart-context";
import { formatCurrency } from "@/lib/utils";

const FALLBACK_IMAGE = "/placeholder-product.svg";

export function CartDrawer() {
  const { isOpen, closeCart, items, setQuantity, removeItem, clearCart, subtotal, count } = useCart();
  const drawerRef = useRef<HTMLDivElement>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (prevIsOpen !== isOpen) {
    setPrevIsOpen(isOpen);
    if (!isOpen) setConfirmClear(false);
  }

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    const previous = document.activeElement as HTMLElement | null;
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    drawerRef.current?.querySelector<HTMLButtonElement>("[data-close]")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previous?.focus();
    };
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  return (
    <div ref={drawerRef} className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title">
      <div
        className="animate-in fade-in absolute inset-0 bg-black/50"
        onClick={closeCart}
      />
      <aside className="animate-in slide-in-from-right absolute top-0 right-0 flex h-full w-full max-w-md flex-col border-l bg-background shadow-xl duration-300">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="size-5 text-accent" />
            <h2 id="cart-drawer-title" className="font-display text-lg font-semibold">Tu carrito</h2>
            <span className="text-sm text-muted-foreground">({count})</span>
          </div>
          <button
            type="button"
            data-close
            onClick={closeCart}
            aria-label="Cerrar carrito"
            className="cursor-pointer rounded-md p-2.5 transition-colors hover:bg-secondary"
          >
            <X className="size-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <ShoppingBag className="size-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Tu carrito está vacío. Añade algunas piezas del catálogo.
            </p>
            <Link
              href="/catalogo"
              onClick={closeCart}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Explorar catálogo <ArrowRight className="size-4" />
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <ul className="flex flex-col gap-4">
                {items.map((item) => (
                  <li key={item.key} className="flex gap-3">
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-md bg-secondary">
                      <Image
                        src={item.imageUrl ?? FALLBACK_IMAGE}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-muted-foreground">
                            {item.kind === "combo" ? "Combo" : "Producto"}
                          </p>
                          <p className="text-sm leading-snug font-medium">{item.name}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.key)}
                          aria-label={`Quitar ${item.name}`}
                          className="cursor-pointer rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setQuantity(item.key, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            aria-label={`Reducir cantidad de ${item.name}`}
                            className="flex size-8 cursor-pointer items-center justify-center rounded-md border transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-40"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => setQuantity(item.key, item.quantity + 1)}
                            disabled={item.quantity >= item.maxQuantity}
                            aria-label={`Aumentar cantidad de ${item.name}`}
                            className="flex size-8 cursor-pointer items-center justify-center rounded-md border transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-40"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                        <span className="text-sm font-semibold">
                          {formatCurrency(item.unitPrice * item.quantity, item.currency)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-4 border-t px-5 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="font-display text-xl font-semibold">
                  {formatCurrency(subtotal, items[0]?.currency ?? "USD")}
                </span>
              </div>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Finalizar pedido <ArrowRight className="size-4" />
              </Link>
              {confirmClear ? (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-muted-foreground">¿Vaciar todo el carrito?</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmClear(false)}
                      className="cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-secondary"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        clearCart();
                        setConfirmClear(false);
                      }}
                      className="cursor-pointer rounded-md bg-destructive px-3 py-1.5 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
                    >
                      Vaciar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                  Vaciar carrito
                </button>
              )}
              <p className="text-center text-xs text-muted-foreground">
                Te contactaremos para coordinar la entrega y el pago.
              </p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
