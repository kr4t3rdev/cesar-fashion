import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SaleForm } from "@/components/admin/sale-form";
import { SalesTable } from "@/components/admin/sales-table";
import { WholesaleProductsTable } from "@/components/admin/wholesale-products-table";
import { wholesaleService } from "@/server/application/wholesale-service";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Ventas mayoristas — Administración",
};

export default async function AdminWholesalePage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "admin" && session.user.role !== "gestor")) redirect("/login");

  const [products, sales, summary] = await Promise.all([
    wholesaleService.listWholesaleProducts(),
    wholesaleService.listSales({ limit: 30 }),
    wholesaleService.summary(),
  ]);

  const productOptions = products.map((p) => ({
    id: p.id,
    name: p.name,
    stock: p.stock,
    price: p.price,
    currency: p.currency,
    wholesaleUnitName: p.wholesaleUnitName,
    wholesaleUnitQuantity: p.wholesaleUnitQuantity,
  }));

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Ventas registradas</CardDescription>
            <CardTitle className="text-3xl font-display">{summary.totalSales}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Ingresos totales</CardDescription>
            <CardTitle className="text-3xl font-display text-accent">
              {formatCurrency(summary.totalRevenue, "USD")}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Piezas vendidas</CardDescription>
            <CardTitle className="text-3xl font-display">{summary.totalPiecesSold}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr] lg:items-start">
        <Card className="lg:sticky lg:top-6">
          <CardHeader>
            <CardTitle>Registrar venta</CardTitle>
            <CardDescription>Selecciona el producto y la cantidad en unidades de venta. El stock se descuenta automáticamente.</CardDescription>
          </CardHeader>
          <CardContent>
            <SaleForm products={productOptions} />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <WholesaleProductsTable products={products} />
          <SalesTable sales={sales} />
        </div>
      </div>
    </div>
  );
}
