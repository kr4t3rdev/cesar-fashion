import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ComboForm } from "@/components/admin/combo-form";
import { CombosTable } from "@/components/admin/combos-table";
import { comboService } from "@/server/application/combo-service";
import { productService } from "@/server/application/product-service";

export const metadata: Metadata = {
  title: "Combos — Administración",
};

export default async function AdminCombosPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "admin" && session.user.role !== "gestor")) redirect("/login");

  const [combos, products] = await Promise.all([comboService.listCombos({ includeInactive: true }), productService.listProducts()]);

  const productOptions = products.map((p) => ({ id: p.id, name: p.name, stock: p.stock }));

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-6 lg:grid-cols-[380px_1fr] lg:items-start">
        <Card className="lg:sticky lg:top-6">
          <CardHeader>
            <CardTitle>Nuevo combo</CardTitle>
            <CardDescription>Agrupa varios productos que se venden como uno solo.</CardDescription>
          </CardHeader>
          <CardContent>
            <ComboForm products={productOptions} />
          </CardContent>
        </Card>

        <CombosTable combos={combos} products={productOptions} />
      </div>
    </div>
  );
}
