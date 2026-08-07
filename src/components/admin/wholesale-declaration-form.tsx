"use client";

import { useActionState, useState } from "react";
import { Loader2, PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { declareWholesaleProductAction } from "@/server/application/wholesale-actions";
import { cn } from "@/lib/utils";

export interface WholesaleProductOption {
  id: string;
  name: string;
  stock: number;
  isWholesale: boolean;
  wholesaleUnitName: string | null;
  wholesaleUnitQuantity: number;
}

const initialState = { ok: false, message: "" };

export function WholesaleDeclarationForm({ products }: { products: WholesaleProductOption[] }) {
  const [state, formAction, pending] = useActionState(declareWholesaleProductAction, initialState);
  const fieldErrors = (state as { fieldErrors?: Record<string, string[]> })?.fieldErrors;

  const [selected, setSelected] = useState("");
  const [unitName, setUnitName] = useState("");
  const [quantity, setQuantity] = useState(1);

  const product = products.find((p) => p.id === selected);

  const selectProduct = (id: string) => {
    setSelected(id);
    const p = products.find((x) => x.id === id);
    if (p) {
      setUnitName(p.wholesaleUnitName ?? "");
      setQuantity(p.wholesaleUnitQuantity || 1);
    }
  };

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="grid gap-2">
        <Label htmlFor="wdecl-product">Producto</Label>
        <select
          id="wdecl-product"
          name="productId"
          required
          value={selected}
          onChange={(e) => selectProduct(e.target.value)}
          className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        >
          <option value="">Selecciona producto</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} · {p.stock} uds{p.isWholesale ? " (declarado)" : ""}
            </option>
          ))}
        </select>
        {fieldErrors?.productId && <p className="text-sm text-destructive">{fieldErrors.productId[0]}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="wdecl-unit">Unidad de venta</Label>
          <Input
            id="wdecl-unit"
            name="wholesaleUnitName"
            value={unitName}
            onChange={(e) => setUnitName(e.target.value)}
            placeholder="Caja, docena, pack…"
            required
          />
          {fieldErrors?.wholesaleUnitName && <p className="text-sm text-destructive">{fieldErrors.wholesaleUnitName[0]}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="wdecl-qty">Piezas por unidad</Label>
          <Input
            id="wdecl-qty"
            name="wholesaleUnitQuantity"
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            required
          />
          {fieldErrors?.wholesaleUnitQuantity && <p className="text-sm text-destructive">{fieldErrors.wholesaleUnitQuantity[0]}</p>}
        </div>
      </div>

      {product && product.isWholesale && (
        <p className="rounded-md border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-accent">
          Ya está declarado al por mayor. Guardar actualizará su unidad de venta.
        </p>
      )}

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
        {pending ? <Loader2 className="animate-spin" /> : <PackagePlus className="size-4" />}
        {pending ? "Declarando…" : product?.isWholesale ? "Actualizar declaración" : "Declarar al por mayor"}
      </Button>
    </form>
  );
}
