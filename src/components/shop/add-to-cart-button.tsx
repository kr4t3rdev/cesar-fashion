"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { useCart, type CartAddInput } from "@/components/shop/cart/cart-context";
import { cn } from "@/lib/utils";

interface AddToCartButtonProps {
  item: CartAddInput;
  label?: string;
  className?: string;
}

export function AddToCartButton({ item, label, className }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const disabled = item.maxQuantity <= 0;

  const handleClick = () => {
    if (disabled) return;
    addItem(item);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-label={label ?? `Añadir ${item.name} al carrito`}
      aria-live="polite"
      title={disabled ? "Sin stock" : label ?? "Añadir al carrito"}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-background/95 text-foreground shadow-sm backdrop-blur transition-all",
        label
          ? "h-12 rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
          : "size-10 border border-foreground/10 hover:border-accent/50 hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-40",
        className
      )}
    >
      {added ? (
        <Check className={label ? "size-5" : "size-4"} />
      ) : (
        <Plus className={label ? "size-5" : "size-4"} />
      )}
      {label && (added ? "Añadido" : label)}
    </button>
  );
}
