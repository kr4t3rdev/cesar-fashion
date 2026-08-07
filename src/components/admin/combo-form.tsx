"use client";

import { useActionState, useState } from "react";
import { Loader2, Plus, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { createComboAction } from "@/server/application/combo-actions";
import { cn, formatCurrency } from "@/lib/utils";

export interface ComboProductOption {
  id: string;
  name: string;
  stock: number;
  price: number;
  currency: string;
}

const initialState = { ok: false, message: "" };

export function ComboForm({ products }: { products: ComboProductOption[] }) {
  const [state, formAction, pending] = useActionState(createComboAction, initialState);
  const fieldErrors = (state as { fieldErrors?: Record<string, string[]> })?.fieldErrors;
  const [items, setItems] = useState([{ productId: "", quantity: 1 }]);

  const availableProducts = (excludeId: string) => {
    const used = items.map((i) => i.productId).filter((id) => id !== "" && id !== excludeId);
    return products.filter((p) => !used.includes(p.id));
  };

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="grid gap-2">
        <Label htmlFor="combo-name">Nombre del combo</Label>
        <Input id="combo-name" name="name" placeholder="Ej. Set playera + pantalón" required />
        {fieldErrors?.name && <p className="text-sm text-destructive">{fieldErrors.name[0]}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="combo-description">Descripción</Label>
        <Textarea id="combo-description" name="description" placeholder="Qué incluye y por qué es una buena compra…" rows={3} required />
        {fieldErrors?.description && <p className="text-sm text-destructive">{fieldErrors.description[0]}</p>}
      </div>

      <div className="grid gap-2">
        <Label>Productos incluidos</Label>
        <div className="flex flex-col gap-3">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2 rounded-lg border bg-muted/40 p-2">
              <select
                name="productId"
                required
                aria-label={`Producto ${index + 1}`}
                value={item.productId}
                onChange={(e) => {
                  const next = [...items];
                  next[index] = { ...next[index], productId: e.target.value };
                  setItems(next);
                }}
                className="border-input flex h-9 flex-1 rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              >
                <option value="">Selecciona producto</option>
                {availableProducts(item.productId).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} · {formatCurrency(p.price, p.currency)} {p.currency}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-1">
                <Label htmlFor={`combo-qty-${index}`} className="sr-only">
                  Cantidad
                </Label>
                <Input
                  id={`combo-qty-${index}`}
                  name="quantity"
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => {
                    const next = [...items];
                    next[index] = { ...next[index], quantity: Number(e.target.value) };
                    setItems(next);
                  }}
                  className="w-20"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Quitar producto"
                disabled={items.length === 1}
                onClick={() => setItems(items.filter((_, i) => i !== index))}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="size-4" />
              </Button>
            </div>
          ))}
        </div>
        {fieldErrors?.items && <p className="text-sm text-destructive">{fieldErrors.items[0]}</p>}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setItems([...items, { productId: "", quantity: 1 }])}
          className="w-fit"
        >
          <Plus className="size-4" />
          Agregar producto
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="combo-price">Precio (USD)</Label>
          <Input id="combo-price" name="price" type="number" step="0.01" min="0.01" placeholder="129.00" required />
          {fieldErrors?.price && <p className="text-sm text-destructive">{fieldErrors.price[0]}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="combo-sale">Precio oferta (USD)</Label>
          <Input id="combo-sale" name="salePrice" type="number" step="0.01" min="0" placeholder="109.00" />
          {fieldErrors?.salePrice && <p className="text-sm text-destructive">{fieldErrors.salePrice[0]}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="combo-image">URL de imagen</Label>
          <Input id="combo-image" name="imageUrl" type="url" placeholder="https://…" />
          {fieldErrors?.imageUrl && <p className="text-sm text-destructive">{fieldErrors.imageUrl[0]}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="combo-label">Etiqueta de oferta</Label>
          <Input id="combo-label" name="saleLabel" placeholder="Pack ahorro, Edición limitada…" />
          {fieldErrors?.saleLabel && <p className="text-sm text-destructive">{fieldErrors.saleLabel[0]}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-lg border bg-muted/40 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label htmlFor="combo-onsale">En oferta</Label>
            <p className="text-xs text-muted-foreground">Aplica un precio promocional al combo.</p>
          </div>
          <Switch name="isOnSale" id="combo-onsale" />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label htmlFor="combo-featured">Destacado</Label>
            <p className="text-xs text-muted-foreground">Aparece al inicio de la sección de combos.</p>
          </div>
          <Switch name="featured" id="combo-featured" />
        </div>
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
        {pending ? <Loader2 className="animate-spin" /> : <ShoppingBag className="size-4" />}
        {pending ? "Guardando…" : "Crear combo"}
      </Button>
    </form>
  );
}
