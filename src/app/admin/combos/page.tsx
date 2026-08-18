import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ComboForm } from "@/components/admin/combo-form";
import { CombosTable } from "@/components/admin/combos-table";
import { catalogApi } from "@/lib/api";
import { comboFromApi, productFromApi } from "@/lib/api/adapters";
import { getServerUser, isStaff } from "@/lib/api/server-auth";

export const metadata: Metadata = {
  title: "Combos — Administración",
};

export default async function AdminCombosPage() {
  const user = await getServerUser();
  if (!user || !isStaff(user)) redirect("/login");

  const [apiCombos, apiProducts] = await Promise.all([catalogApi.combos(true), catalogApi.products()]);
  const combos = apiCombos.map(comboFromApi);
  const products = apiProducts.map(productFromApi);

  const productOptions = products.map((p) => ({ id: p.id, name: p.name, stock: p.stock, price: p.price, currency: p.currency }));

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr] lg:items-start">
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
