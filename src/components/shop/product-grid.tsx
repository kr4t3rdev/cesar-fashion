import { ProductCard } from "@/components/shop/product-card";
import type { ProductEntity } from "@/lib/domain/product";

export function ProductGrid({ products }: { products: ProductEntity[] }) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
        <p className="font-display text-lg font-semibold">Sin productos</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Aún no hay productos en esta sección. Vuelve pronto.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
