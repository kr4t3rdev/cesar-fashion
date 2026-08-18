import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OrdersTable } from "@/components/admin/orders-table";
import { listOrdersFromApi } from "@/lib/api/server-data";
import { formatCurrency } from "@/lib/utils";
import { getServerUser, isStaff } from "@/lib/api/server-auth";

export const metadata: Metadata = {
  title: "Pedidos — Administración",
};

export default async function AdminOrdersPage() {
  const user = await getServerUser();
  if (!user || !isStaff(user)) redirect("/login");

  const orders = await listOrdersFromApi({ limit: 200 });
  const pending = orders.filter((o) => o.status === "pending");
  const paid = orders.filter((o) => o.status === "paid");
  const cancelled = orders.filter((o) => o.status === "cancelled");
  const revenue = paid.reduce((acc, o) => acc + o.total, 0);

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Pedidos pendientes</CardDescription>
            <CardTitle className="text-3xl font-display text-accent">{pending.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Pedidos pagados</CardDescription>
            <CardTitle className="text-3xl font-display">{paid.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Ingresos de pedidos</CardDescription>
            <CardTitle className="text-3xl font-display">{formatCurrency(revenue, "USD")}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Cancelados</CardDescription>
            <CardTitle className="text-3xl font-display">{cancelled.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <OrdersTable orders={orders} />
    </div>
  );
}
