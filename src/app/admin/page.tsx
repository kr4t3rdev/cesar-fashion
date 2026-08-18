import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductForm } from "@/components/admin/product-form";
import { InventoryTable } from "@/components/admin/inventory-table";
import { productFromApi } from "@/lib/api/adapters";
import { catalogApi } from "@/lib/api";
import { pendingOrdersCount } from "@/lib/api/server-data";
import { getServerUser, isStaff } from "@/lib/api/server-auth";

export const metadata: Metadata = {
  title: "Dashboard — Administración",
};

export default async function AdminDashboardPage() {
  const user = await getServerUser();
  if (!user || !isStaff(user)) redirect("/login");

  const [apiProducts, pendingOrders] = await Promise.all([
    catalogApi.products(),
    pendingOrdersCount(),
  ]);
  const products = apiProducts.map(productFromApi);

  const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
  const onSaleCount = products.filter((p) => p.isOnSale).length;

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Productos</CardDescription>
            <CardTitle className="text-3xl font-display">{products.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Unidades en stock</CardDescription>
            <CardTitle className="text-3xl font-display">{totalStock}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>En oferta</CardDescription>
            <CardTitle className="text-3xl font-display text-accent">{onSaleCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Pedidos pendientes</CardDescription>
            <CardTitle className="text-3xl font-display">
              <Link href="/admin/pedidos" className="transition-colors hover:text-accent">
                {pendingOrders}
              </Link>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr] lg:items-start">
        <Card className="lg:sticky lg:top-6">
          <CardHeader>
            <CardTitle>Nuevo producto</CardTitle>
            <CardDescription>Completa el formulario para añadir una pieza al inventario.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProductForm />
          </CardContent>
        </Card>

        <InventoryTable products={products} />
      </div>
    </div>
  );
}
