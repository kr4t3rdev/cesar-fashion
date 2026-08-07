"use client";

import Image from "next/image";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { WholesaleSaleEntity } from "@/server/domain/wholesale";

const FALLBACK_IMAGE = "/placeholder-product.svg";

export function SalesTable({ sales }: { sales: WholesaleSaleEntity[] }) {
  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div>
          <h2 className="font-display text-lg font-semibold">Historial de ventas mayoristas</h2>
          <p className="text-xs text-muted-foreground">Últimas ventas registradas</p>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-14">Imagen</TableHead>
            <TableHead>Producto</TableHead>
            <TableHead>Venta</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Registrada por</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                Aún no hay ventas registradas.
              </TableCell>
            </TableRow>
          ) : (
            sales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>
                  <div className="relative size-9 overflow-hidden rounded-md bg-secondary">
                    <Image src={sale.productImageUrl ?? FALLBACK_IMAGE} alt={sale.productName} fill sizes="36px" className="object-cover" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{sale.productName}</div>
                  <div className="text-xs text-muted-foreground">{formatDate(sale.createdAt)}</div>
                </TableCell>
                <TableCell>
                  <div>
                    {sale.units} {sale.unitName}
                    {sale.units > 1 ? "s" : ""} × {sale.piecesPerUnit} pz
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <Badge variant="secondary">{sale.pieces} piezas</Badge> a{" "}
                    {formatCurrency(sale.pricePerUnit, "USD")} c/u
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium text-accent">
                  {formatCurrency(sale.total, "USD")}
                </TableCell>
                <TableCell className="text-muted-foreground">{sale.customer ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{sale.createdByName ?? "—"}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
