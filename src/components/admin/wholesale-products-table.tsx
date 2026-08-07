"use client";

import Image from "next/image";
import { useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { productHasWholesaleUnit, wholesaleUnitsAvailable } from "@/server/domain/wholesale";
import { undeclareWholesaleProductAction } from "@/server/application/wholesale-actions";
import type { WholesaleProductEntity } from "@/server/domain/wholesale";

const FALLBACK_IMAGE = "/placeholder-product.svg";

function RemoveButton({ product }: { product: WholesaleProductEntity }) {
  const [pending, startTransition] = useTransition();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!confirm(`¿Retirar "${product.name}" de la venta al por mayor?`)) return;
        startTransition(async () => {
          await undeclareWholesaleProductAction(new FormData(e.currentTarget));
        });
      }}
    >
      <input type="hidden" name="id" value={product.id} />
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        disabled={pending}
        aria-label={`Retirar ${product.name} de la venta al por mayor`}
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        {pending ? <Loader2 className="animate-spin" /> : <Trash2 className="size-4" />}
        Retirar
      </Button>
    </form>
  );
}

export function WholesaleProductsTable({ products }: { products: WholesaleProductEntity[] }) {
  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div>
          <h2 className="font-display text-lg font-semibold">Productos declarados al por mayor</h2>
          <p className="text-xs text-muted-foreground">
            {products.length} {products.length === 1 ? "producto" : "productos"} declarados. Usa el formulario para declarar o retirar productos.
          </p>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-14">Imagen</TableHead>
            <TableHead>Producto</TableHead>
            <TableHead>Unidad de venta</TableHead>
            <TableHead className="text-right">Precio por unidad</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Disponible</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                Aún no hay productos declarados al por mayor. Declara el primero con el formulario.
              </TableCell>
            </TableRow>
          ) : (
            products.map((p) => {
              const hasUnit = productHasWholesaleUnit(p);
              const available = wholesaleUnitsAvailable(p, hasUnit ? p.wholesaleUnitQuantity : 1);
              return (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="relative size-9 overflow-hidden rounded-md bg-secondary">
                      <Image src={p.imageUrl ?? FALLBACK_IMAGE} alt={p.name} fill sizes="36px" className="object-cover" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{formatCurrency(p.price, p.currency)} por pieza</div>
                  </TableCell>
                  <TableCell>
                    {hasUnit ? (
                      <Badge variant="secondary">
                        {p.wholesaleUnitName} · {p.wholesaleUnitQuantity} pz
                      </Badge>
                    ) : (
                      <Badge variant="outline">Sin configurar</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {hasUnit ? formatCurrency(p.price * p.wholesaleUnitQuantity, p.currency) : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.stock > 0 ? "secondary" : "destructive"}>{p.stock} pz</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {hasUnit ? `${available} ${p.wholesaleUnitName}${available === 1 ? "" : "s"}` : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <RemoveButton product={p} />
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
