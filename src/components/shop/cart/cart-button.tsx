"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/shop/cart/cart-context";

export function CartButton() {
  const { count, openCart } = useCart();

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label="Abrir carrito"
      className="relative cursor-pointer rounded-md p-2.5 transition-colors hover:bg-secondary"
    >
      <ShoppingBag className="size-5" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-foreground">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
