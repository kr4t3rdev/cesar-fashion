import { ProductGrid } from "@/components/shop/product-grid";
import { productService } from "@/server/application/product-service";
import { CATEGORIES } from "@/server/domain/product";

export const metadata = {
  title: "Catálogo",
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  Camisetas: "Camisas y camisetas para hombre y mujer",
  Pantalones: "Pantalones, jeans y chinos",
  Chaquetas: "Chaquetas, blazers y sacos",
  Vestidos: "Vestidos y faldas",
  Zapatos: "Calzado para hombre y mujer",
  Accesorios: "Bolsos y complementos",
  Sudaderas: "Sudaderas y suéters",
  Abrigos: "Abrigos y trench coats",
  "Belleza Mary Kay": "Maquillaje y accesorios Mary Kay",
  Teléfonos: "Smartphones Samsung y Xiaomi Redmi",
  "Accesorios para teléfonos": "Covers, micas y complementos",
  "Aseo personal": "Cremas, sprays y cuidado personal",
  Perfumes: "Perfumes y fragancias para hombre y mujer",
};

export default async function CatalogoPage() {
  const products = await productService.listProducts();
  const availableCount = products.filter((p) => p.stock > 0).length;

  const grouped = new Map<string, typeof products>();
  for (const category of CATEGORIES) {
    const items = products.filter((p) => p.category === category);
    if (items.length > 0) grouped.set(category, items);
  }
  const orphanCategories = [...new Set(products.map((p) => p.category))].filter(
    (c) => !grouped.has(c),
  );
  for (const category of orphanCategories) {
    grouped.set(category, products.filter((p) => p.category === category));
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Colección completa</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Catálogo</h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          {availableCount} {availableCount === 1 ? "pieza disponible" : "piezas disponibles"} en inventario,
          organizadas por categoría.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {[...grouped.keys()].map((category) => (
          <a
            key={category}
            href={`#${category}`}
            className="rounded-full border px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
          >
            {category}
          </a>
        ))}
      </div>

      <div className="mt-14 space-y-16">
        {[...grouped.entries()].map(([category, items]) => (
          <section key={category} id={category} className="scroll-mt-24">
            <div className="mb-6 flex items-end justify-between border-b pb-4">
              <div>
                <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{category}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {CATEGORY_DESCRIPTIONS[category] ?? "Descubre nuestra selección"}
                </p>
              </div>
              <span className="text-sm tabular-nums text-muted-foreground">
                {items.length} {items.length === 1 ? "artículo" : "artículos"}
              </span>
            </div>
            <ProductGrid products={items} />
          </section>
        ))}
      </div>
    </div>
  );
}
