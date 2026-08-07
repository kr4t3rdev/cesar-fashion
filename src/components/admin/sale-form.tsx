"use client";

import { useActionState, useState } from "react";
import { Loader2, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { registerWholesaleSaleAction } from "@/server/application/wholesale-actions";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

export interface WholesaleProductOption {
  id: string;
  name: string;
  stock: number;
  price: number;
  currency: string;
  wholesaleUnitName: string | null;
  wholesaleUnitQuantity: number;
}

const initialState = { ok: false, message: "" };

export function SaleForm({ products }: { products: WholesaleProductOption[] }) {
  const [state, formAction, pending] = useActionState(registerWholesaleSaleAction, initialState);
  const fieldErrors = (state as { fieldErrors?: Record<string, string[]> })?.fieldErrors;

  const [selected, setSelected] = useState("");
  const [unitName, setUnitName] = useState("");
  const [piecesPerUnit, setPiecesPerUnit] = useState(1);
  const [units, setUnits] = useState(1);
  const [pricePerUnit, setPricePerUnit] = useState(0);

  const product = products.find((p) => p.id === selected);

  const pieces = piecesPerUnit * units;
  const total = pricePerUnit * units;
  const availableUnits = product ? Math.floor(product.stock / (piecesPerUnit || 1)) : 0;

  const selectProduct = (id: string) => {
    setSelected(id);
    const p = products.find((x) => x.id === id);
    if (p) {
      setUnitName(p.wholesaleUnitName ?? "");
      setPiecesPerUnit(p.wholesaleUnitQuantity || 1);
      setPricePerUnit(p.price);
    }
  };

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="grid gap-2">
        <Label htmlFor="sale-product">Producto</Label>
        <select
          id="sale-product"
          name="productId"
          required
          value={selected}
          onChange={(e) => selectProduct(e.target.value)}
          className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        >
          <option value="">Selecciona producto</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} · {p.stock} uds
            </option>
          ))}
        </select>
        {fieldErrors?.productId && <p className="text-sm text-destructive">{fieldErrors.productId[0]}</p>}
        {product && product.stock === 0 && <p className="text-sm text-destructive">Este producto está agotado.</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="sale-unit-name">Unidad de venta</Label>
          <Input
            id="sale-unit-name"
            name="unitName"
            value={unitName}
            onChange={(e) => setUnitName(e.target.value)}
            placeholder="Caja, docena, pack…"
            required
          />
          {fieldErrors?.unitName && <p className="text-sm text-destructive">{fieldErrors.unitName[0]}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="sale-pieces">Piezas por unidad</Label>
          <Input
            id="sale-pieces"
            name="piecesPerUnit"
            type="number"
            min={1}
            value={piecesPerUnit}
            onChange={(e) => setPiecesPerUnit(Number(e.target.value))}
            required
          />
          {fieldErrors?.piecesPerUnit && <p className="text-sm text-destructive">{fieldErrors.piecesPerUnit[0]}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="sale-units">Cantidad ({unitName || "unidades"})</Label>
          <Input
            id="sale-units"
            name="units"
            type="number"
            min={1}
            value={units}
            onChange={(e) => setUnits(Number(e.target.value))}
            required
          />
          {fieldErrors?.units && <p className="text-sm text-destructive">{fieldErrors.units[0]}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="sale-price">Precio por {unitName || "unidad"} (USD)</Label>
          <Input
            id="sale-price"
            name="pricePerUnit"
            type="number"
            step="0.01"
            min="0.01"
            value={pricePerUnit}
            onChange={(e) => setPricePerUnit(Number(e.target.value))}
            required
          />
          {fieldErrors?.pricePerUnit && <p className="text-sm text-destructive">{fieldErrors.pricePerUnit[0]}</p>}
        </div>
      </div>

      {product && (
        <div className="flex flex-col gap-2 rounded-lg border bg-muted/40 p-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Piezas totales</span>
            <span className="font-semibold">{pieces}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Total de la venta</span>
            <span className="font-semibold text-accent">{formatCurrency(total, product.currency)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              Disponible (a {piecesPerUnit || 1} piezas por unidad)
            </span>
            <span className={cn("font-semibold", availableUnits < units ? "text-destructive" : "")}>
              {availableUnits} {unitName || "unidades"}
            </span>
          </div>
        </div>
      )}

      <div className="grid gap-2">
        <Label htmlFor="sale-customer">Cliente (opcional)</Label>
        <Input id="sale-customer" name="customer" placeholder="Nombre del comprador mayorista" />
        {fieldErrors?.customer && <p className="text-sm text-destructive">{fieldErrors.customer[0]}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="sale-note">Nota (opcional)</Label>
        <Textarea id="sale-note" name="note" placeholder="Detalles de la venta…" rows={2} />
        {fieldErrors?.note && <p className="text-sm text-destructive">{fieldErrors.note[0]}</p>}
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
        {pending ? <Loader2 className="animate-spin" /> : <PackageCheck className="size-4" />}
        {pending ? "Registrando…" : "Registrar venta"}
      </Button>
    </form>
  );
}
