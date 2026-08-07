"use client";

import { useTransition } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { markOrderPaidAction, cancelOrderAction } from "@/server/application/order-actions";
import { orderReference, ORDER_STATUS_LABELS, type OrderEntity, type OrderStatus } from "@/server/domain/order";
import { formatCurrency, formatDate } from "@/lib/utils";

const STATUS_VARIANT: Record<OrderStatus, "secondary" | "success" | "destructive" | "outline"> = {
  pending: "outline",
  paid: "success",
  cancelled: "destructive",
};

function OrderActions({ order }: { order: OrderEntity }) {
  const [paidPending, startPaid] = useTransition();
  const [cancelPending, startCancel] = useTransition();

  if (order.status !== "pending") return null;

  return (
    <div className="flex items-center justify-end gap-1">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          startPaid(async () => {
            await markOrderPaidAction(new FormData(e.currentTarget));
          });
        }}
      >
        <input type="hidden" name="id" value={order.id} />
        <Button
          type="submit"
          size="sm"
          variant="outline"
          disabled={paidPending}
          className="border-success/40 text-success hover:bg-success/10"
        >
          {paidPending ? <Loader2 className="animate-spin" /> : <CheckCircle2 className="size-4" />}
          Pagado
        </Button>
      </form>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!confirm("¿Cancelar el pedido? Se repondrá el stock.")) return;
          startCancel(async () => {
            await cancelOrderAction(new FormData(e.currentTarget));
          });
        }}
      >
        <input type="hidden" name="id" value={order.id} />
        <Button
          type="submit"
          size="sm"
          variant="ghost"
          disabled={cancelPending}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          {cancelPending ? <Loader2 className="animate-spin" /> : <XCircle className="size-4" />}
          Cancelar
        </Button>
      </form>
    </div>
  );
}

export function OrdersTable({ orders }: { orders: OrderEntity[] }) {
  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div>
          <h2 className="font-display text-lg font-semibold">Pedidos de la tienda</h2>
          <p className="text-xs text-muted-foreground">
            {orders.length} {orders.length === 1 ? "pedido" : "pedidos"} · el stock se descuenta al crear el pedido
          </p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Referencia</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Artículos</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  Todavía no hay pedidos de la tienda.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <div className="font-medium">{orderReference(order.id)}</div>
                    <div className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{order.customerName}</div>
                    <div className="text-xs text-muted-foreground">
                      {order.customerPhone}
                      {order.customerPhone && order.customerEmail ? " · " : ""}
                      {order.customerEmail}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex max-w-56 flex-col gap-1">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-2 text-sm">
                          <span className="truncate">{item.name}</span>
                          <span className="shrink-0 text-muted-foreground">× {item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    {order.note && (
                      <p className="mt-1 max-w-56 truncate text-xs text-muted-foreground" title={order.note}>
                        Nota: {order.note}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(order.total, order.currency)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[order.status]}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </Badge>
                    {order.confirmedByName && (
                      <p className="mt-1 text-xs text-muted-foreground">por {order.confirmedByName}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <OrderActions order={order} />
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
