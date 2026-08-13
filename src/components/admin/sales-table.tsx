"use client";

import { Download, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { orderReference, type OrderEntity } from "@/server/domain/order";
import { formatCurrency, formatDate } from "@/lib/utils";
import { downloadOrderPdf, downloadOrdersReportPdf } from "@/lib/order-pdf";

export function SalesTable({ sales }: { sales: OrderEntity[] }) {
  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div>
          <h2 className="font-display text-lg font-semibold">Ventas registradas</h2>
          <p className="text-xs text-muted-foreground">
            Pedidos de la tienda marcados como pagados · {sales.length} {sales.length === 1 ? "venta" : "ventas"}
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => downloadOrdersReportPdf(sales, "Reporte de ventas")}>
          <Download className="size-4" /> Descargar reporte
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Referencia</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Artículos</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Confirmado por</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="text-right">PDF</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  Todavía no hay ventas registradas. Cuando un pedido se marque como pagado aparecerá aquí.
                </TableCell>
              </TableRow>
            ) : (
              sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>
                    <div className="font-medium">{orderReference(sale.id)}</div>
                    <div className="text-xs text-muted-foreground">{formatDate(sale.createdAt)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{sale.customerName}</div>
                    <div className="text-xs text-muted-foreground">
                      {sale.customerPhone}
                      {sale.customerPhone && sale.customerEmail ? " · " : ""}
                      {sale.customerEmail}
                    </div>
                    {sale.customerId && (
                      <Badge variant="outline" className="mt-1">
                        Cuenta registrada
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex max-w-56 flex-col gap-1">
                      {sale.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-2 text-sm">
                          <span className="truncate">{item.name}</span>
                          <span className="shrink-0 text-muted-foreground">× {item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    {sale.note && (
                      <p className="mt-1 max-w-56 truncate text-xs text-muted-foreground" title={sale.note}>
                        Nota: {sale.note}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium text-accent">
                    {formatCurrency(sale.total, sale.currency)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{sale.confirmedByName ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(sale.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button type="button" size="sm" variant="ghost" onClick={() => downloadOrderPdf(sale)} aria-label={`Descargar PDF de ${orderReference(sale.id)}`}>
                      <FileText className="size-4" /> PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
