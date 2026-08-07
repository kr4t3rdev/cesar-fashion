"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2, Plus, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { updateComboAction } from "@/server/application/combo-actions";
import type { ComboEntity } from "@/server/domain/combo";
import type { ComboProductOption } from "@/components/admin/combo-form";
import { cn } from "@/lib/utils";

const initialState = { ok: false, message: "" };

export function EditComboForm({
  combo,
  products,
  onDone,
}: {
  combo: ComboEntity;
  products: ComboProductOption[];
  onDone?: () => void;
}) {
  const [state, formAction, pending] = useActionState(updateComboAction, initialState);
  const fieldErrors = (state as { fieldErrors?: Record<string, string[]> })?.fieldErrors;

  const [items, setItems] = useState(
    combo.items.map((i) => ({ productId: i.productId, quantity: i.quantity }))
  );

  useEffect(() => {
    if (state.ok) onDone?.();
  }, [state.ok, onDone]);

  const availableProducts = (excludeId: string) => {
    const used = items.map((i) => i.productId).filter((id) => id !== "" && id !== excludeId);
    return products.filter((p) => !used.includes(p.id));
  };

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="id" value={combo.id} />
      <div className="grid gap-2">
        <Label htmlFor={`combo-name-${combo.id}`}>Nombre del combo</Label>
        <Input id={`combo-name-${combo.id}`} name="name" defaultValue={combo.name} required />
        {fieldErrors?.name && <p className="text-sm text-destructive">{fieldErrors.name[0]}</p>}
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`combo-desc-${combo.id}`}>Descripción</Label>
        <Textarea id={`combo-desc-${combo.id}`} name="description" defaultValue={combo.description} rows={3} required />
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
                    {p.name} · {p.stock} uds
                  </option>
                ))}
              </select>
              <Input
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
          <Label htmlFor={`combo-price-${combo.id}`}>Precio (USD)</Label>
          <Input id={`combo-price-${combo.id}`} name="price" type="number" step="0.01" min="0.01" defaultValue={combo.price} required />
          {fieldErrors?.price && <p className="text-sm text-destructive">{fieldErrors.price[0]}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`combo-sale-${combo.id}`}>Precio oferta (USD)</Label>
          <Input id={`combo-sale-${combo.id}`} name="salePrice" type="number" step="0.01" min="0" defaultValue={combo.salePrice ?? ""} />
          {fieldErrors?.salePrice && <p className="text-sm text-destructive">{fieldErrors.salePrice[0]}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor={`combo-image-${combo.id}`}>URL de imagen</Label>
          <Input id={`combo-image-${combo.id}`} name="imageUrl" type="url" defaultValue={combo.imageUrl ?? ""} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`combo-label-${combo.id}`}>Etiqueta de oferta</Label>
          <Input id={`combo-label-${combo.id}`} name="saleLabel" defaultValue={combo.saleLabel ?? ""} />
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-lg border bg-muted/40 p-4">
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor={`combo-onsale-${combo.id}`}>En oferta</Label>
          <Switch name="isOnSale" id={`combo-onsale-${combo.id}`} defaultChecked={combo.isOnSale} />
        </div>
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor={`combo-featured-${combo.id}`}>Destacado</Label>
          <Switch name="featured" id={`combo-featured-${combo.id}`} defaultChecked={combo.featured} />
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
        {pending ? <Loader2 className="animate-spin" /> : <Save className="size-4" />}
        {pending ? "Guardando…" : "Guardar cambios"}
      </Button>
    </form>
  );
}
