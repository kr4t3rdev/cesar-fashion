import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WholesaleDeclarationForm } from "@/components/admin/wholesale-declaration-form";
import { WholesaleProductsTable } from "@/components/admin/wholesale-products-table";
import { wholesaleService } from "@/server/application/wholesale-service";

export const metadata: Metadata = {
  title: "Productos al por mayor — Administración",
};

export default async function AdminWholesalePage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "admin" && session.user.role !== "gestor")) redirect("/login");

  const [products, wholesaleProducts] = await Promise.all([
    wholesaleService.listProducts(),
    wholesaleService.listWholesaleProducts(),
  ]);

  const productOptions = products.map((p) => ({
    id: p.id,
    name: p.name,
    stock: p.stock,
    price: p.price,
    currency: p.currency,
    isWholesale: p.isWholesale,
    wholesaleUnitName: p.wholesaleUnitName,
    wholesaleUnitQuantity: p.wholesaleUnitQuantity,
  }));

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr] lg:items-start">
      <Card className="lg:sticky lg:top-6">
        <CardHeader>
          <CardTitle>Declarar producto al por mayor</CardTitle>
          <CardDescription>
            Marca un producto para venderlo por cantidades (cajas, docenas, packs) indicando su unidad de venta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WholesaleDeclarationForm products={productOptions} />
        </CardContent>
      </Card>

      <WholesaleProductsTable products={wholesaleProducts} />
    </div>
  );
}
