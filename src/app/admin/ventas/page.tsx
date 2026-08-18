import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SalesTable } from "@/components/admin/sales-table";
import { listOrdersFromApi } from "@/lib/api/server-data";
import { formatCurrency } from "@/lib/utils";
import { getServerUser, isStaff } from "@/lib/api/server-auth";

export const metadata: Metadata = {
  title: "Ventas — Administración",
};

export default async function AdminSalesPage() {
  const user = await getServerUser();
  if (!user || !isStaff(user)) redirect("/login");

  const sales = await listOrdersFromApi({ status: "paid", limit: 200 });
  const revenue = sales.reduce((acc, sale) => acc + sale.total, 0);
  const totalPieces = sales.reduce(
    (acc, sale) => acc + sale.items.reduce((sum, item) => sum + item.quantity, 0),
    0
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Ventas realizadas</CardDescription>
            <CardTitle className="text-3xl font-display">{sales.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Ingresos</CardDescription>
            <CardTitle className="text-3xl font-display text-accent">{formatCurrency(revenue, "USD")}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Piezas vendidas</CardDescription>
            <CardTitle className="text-3xl font-display">{totalPieces}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Ticket promedio</CardDescription>
            <CardTitle className="text-3xl font-display">
              {sales.length > 0 ? formatCurrency(revenue / sales.length, "USD") : formatCurrency(0, "USD")}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <SalesTable sales={sales} />
    </div>
  );
}
