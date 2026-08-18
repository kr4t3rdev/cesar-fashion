import { Tag } from "lucide-react";
import { ProductGrid } from "@/components/shop/product-grid";
import { catalogApi } from "@/lib/api";
import { productFromApi } from "@/lib/api/adapters";
import { productIsOnSale } from "@/lib/domain/product";

export const metadata = {
  title: "Ofertas",
};

export default async function OfertasPage() {
  const products = (await catalogApi.products()).map(productFromApi);
  const onSale = products.filter((p) => productIsOnSale(p));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-accent/30 px-3 py-1 text-xs font-medium uppercase tracking-widest text-accent">
          <Tag className="size-3.5" />
          Ofertas activas
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Ofertas</h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          Piezas seleccionadas con descuentos exclusivos, disponibles por tiempo limitado.
        </p>
      </div>
      <ProductGrid products={onSale} />
    </div>
  );
}
