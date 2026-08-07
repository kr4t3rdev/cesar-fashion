import { ProductGrid } from "@/components/shop/product-grid";
import { productService } from "@/server/application/product-service";

export const metadata = {
  title: "Catálogo",
};

export default async function CatalogoPage() {
  const products = await productService.listProducts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Colección completa</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Catálogo</h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          {products.length} {products.length === 1 ? "pieza disponible" : "piezas disponibles"} en inventario.
        </p>
      </div>
      <ProductGrid products={products} />
    </div>
  );
}
