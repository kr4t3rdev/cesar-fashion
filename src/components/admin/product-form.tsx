"use client";

import { useActionState, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { createProductAction } from "@/server/application/actions";
import { CATEGORIES } from "@/server/domain/product";
import { cn } from "@/lib/utils";

const initialState = { ok: false, message: "" };

export function ProductForm() {
  const [state, formAction, pending] = useActionState(createProductAction, initialState);
  const fieldErrors = (state as { fieldErrors?: Record<string, string[]> })?.fieldErrors;
  const [isWholesale, setIsWholesale] = useState(false);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="grid gap-2">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" name="name" placeholder="Blazer estructurado Milano" required />
        {fieldErrors?.name && <p className="text-sm text-destructive">{fieldErrors.name[0]}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea id="description" name="description" placeholder="Describe el producto, materiales y acabados…" rows={3} required />
        {fieldErrors?.description && <p className="text-sm text-destructive">{fieldErrors.description[0]}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="category">Categoría</Label>
        <select
          id="category"
          name="category"
          required
          defaultValue="Camisetas"
          className="border-input data-[placeholder]:text-muted-foreground flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
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
          <Label htmlFor="price">Precio (USD)</Label>
          <Input id="price" name="price" type="number" step="0.01" min="0.01" placeholder="99.00" required />
          {fieldErrors?.price && <p className="text-sm text-destructive">{fieldErrors.price[0]}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="salePrice">Precio de oferta (USD)</Label>
          <Input id="salePrice" name="salePrice" type="number" step="0.01" min="0" placeholder="79.00" />
          {fieldErrors?.salePrice && <p className="text-sm text-destructive">{fieldErrors.salePrice[0]}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="stock">Stock</Label>
          <Input id="stock" name="stock" type="number" step="1" min="0" placeholder="10" required />
          {fieldErrors?.stock && <p className="text-sm text-destructive">{fieldErrors.stock[0]}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="imageUrl">URL de imagen</Label>
          <Input id="imageUrl" name="imageUrl" type="url" placeholder="https://…" />
          {fieldErrors?.imageUrl && <p className="text-sm text-destructive">{fieldErrors.imageUrl[0]}</p>}
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="saleLabel">Etiqueta de oferta</Label>
        <Input id="saleLabel" name="saleLabel" placeholder="Oferta de temporada, Últimas unidades…" />
        {fieldErrors?.saleLabel && <p className="text-sm text-destructive">{fieldErrors.saleLabel[0]}</p>}
      </div>

      <div className="flex flex-col gap-4 rounded-lg border bg-muted/40 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label htmlFor="isOnSale">En oferta</Label>
            <p className="text-xs text-muted-foreground">Muestra el producto en la sección de ofertas.</p>
          </div>
          <Switch name="isOnSale" id="isOnSale" />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label htmlFor="featured">Destacado</Label>
            <p className="text-xs text-muted-foreground">Aparece en la portada de la tienda.</p>
          </div>
          <Switch name="featured" id="featured" />
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-lg border bg-muted/40 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label htmlFor="isWholesale">Venta al por mayor</Label>
            <p className="text-xs text-muted-foreground">Se vende por cantidades (cajas, docenas, packs) en la sección Por mayor.</p>
          </div>
          <Switch
            name="isWholesale"
            id="isWholesale"
            checked={isWholesale}
            onCheckedChange={(checked) => setIsWholesale(checked === true)}
          />
        </div>
        {isWholesale && (
          <div className="grid grid-cols-2 gap-4 border-t pt-4">
            <div className="grid gap-2">
              <Label htmlFor="wholesaleUnitName">Nombre de la unidad</Label>
              <Input id="wholesaleUnitName" name="wholesaleUnitName" placeholder="Caja, docena, pack…" />
              {fieldErrors?.wholesaleUnitName && <p className="text-sm text-destructive">{fieldErrors.wholesaleUnitName[0]}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="wholesaleUnitQuantity">Piezas por unidad</Label>
              <Input id="wholesaleUnitQuantity" name="wholesaleUnitQuantity" type="number" min={1} defaultValue={1} />
              {fieldErrors?.wholesaleUnitQuantity && (
                <p className="text-sm text-destructive">{fieldErrors.wholesaleUnitQuantity[0]}</p>
              )}
            </div>
          </div>
        )}
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
        {pending ? <Loader2 className="animate-spin" /> : <Plus className="size-4" />}
        {pending ? "Guardando…" : "Añadir producto"}
      </Button>
    </form>
  );
}
