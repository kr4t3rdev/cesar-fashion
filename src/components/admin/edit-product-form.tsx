"use client";

import { useActionState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { updateProductAction } from "@/server/application/actions";
import { CATEGORIES, type ProductEntity } from "@/server/domain/product";
import { cn } from "@/lib/utils";

const initialState = { ok: false, message: "" };

export function EditProductForm({ product, onDone }: { product: ProductEntity; onDone?: () => void }) {
  const [state, formAction, pending] = useActionState(updateProductAction, initialState);
  const fieldErrors = (state as { fieldErrors?: Record<string, string[]> })?.fieldErrors;

  useEffect(() => {
    if (state.ok) onDone?.();
  }, [state.ok, onDone]);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="id" value={product.id} />
      <div className="grid gap-2">
        <Label htmlFor={`name-${product.id}`}>Nombre</Label>
        <Input id={`name-${product.id}`} name="name" defaultValue={product.name} required />
        {fieldErrors?.name && <p className="text-sm text-destructive">{fieldErrors.name[0]}</p>}
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`description-${product.id}`}>Descripción</Label>
        <Textarea id={`description-${product.id}`} name="description" defaultValue={product.description} rows={3} required />
        {fieldErrors?.description && <p className="text-sm text-destructive">{fieldErrors.description[0]}</p>}
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`category-${product.id}`}>Categoría</Label>
        <select
          id={`category-${product.id}`}
          name="category"
          defaultValue={product.category}
          className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {fieldErrors?.category && <p className="text-sm text-destructive">{fieldErrors.category[0]}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor={`price-${product.id}`}>Precio (USD)</Label>
          <Input id={`price-${product.id}`} name="price" type="number" step="0.01" min="0.01" defaultValue={product.price} required />
          {fieldErrors?.price && <p className="text-sm text-destructive">{fieldErrors.price[0]}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`sale-${product.id}`}>Precio oferta (USD)</Label>
          <Input id={`sale-${product.id}`} name="salePrice" type="number" step="0.01" min="0" defaultValue={product.salePrice ?? ""} />
          {fieldErrors?.salePrice && <p className="text-sm text-destructive">{fieldErrors.salePrice[0]}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor={`stock-${product.id}`}>Stock</Label>
          <Input id={`stock-${product.id}`} name="stock" type="number" step="1" min="0" defaultValue={product.stock} required />
          {fieldErrors?.stock && <p className="text-sm text-destructive">{fieldErrors.stock[0]}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`image-${product.id}`}>URL imagen</Label>
          <Input id={`image-${product.id}`} name="imageUrl" type="url" defaultValue={product.imageUrl ?? ""} />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`label-${product.id}`}>Etiqueta de oferta</Label>
        <Input id={`label-${product.id}`} name="saleLabel" defaultValue={product.saleLabel ?? ""} />
      </div>
      <div className="flex flex-col gap-4 rounded-lg border bg-muted/40 p-4">
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor={`onsale-${product.id}`}>En oferta</Label>
          <Switch name="isOnSale" id={`onsale-${product.id}`} defaultChecked={product.isOnSale} />
        </div>
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor={`featured-${product.id}`}>Destacado</Label>
          <Switch name="featured" id={`featured-${product.id}`} defaultChecked={product.featured} />
        </div>
      </div>
      {state.message && (
        <div
          className={cn(
            "rounded-md border px-3 py-2 text-sm",
            state.ok
              ? "border-emerald-600/30 bg-emerald-600/10 text-emerald-700 dark:text-emerald-300"
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
