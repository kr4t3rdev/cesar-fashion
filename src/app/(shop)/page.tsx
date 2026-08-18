import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Droplets, Shirt, ShieldCheck, Smartphone, Sparkles, Tag } from "lucide-react";
import { ProductGrid } from "@/components/shop/product-grid";
import { ComboGrid } from "@/components/shop/combo-grid";
import { catalogApi } from "@/lib/api";
import { productFromApi, comboFromApi } from "@/lib/api/adapters";
import { productIsOnSale } from "@/lib/domain/product";

export const metadata = {
  title: "Moda, Belleza y Tecnología — Cesar Fashion LLC",
};

const CATEGORIES = [
  {
    title: "Moda y calzado",
    description: "Ropa y zapatos para hombre y mujer, seleccionados con criterio.",
    icon: Shirt,
  },
  {
    title: "Belleza Mary Kay",
    description: "Accesorios de maquillaje de la mano de Mary Kay.",
    icon: Sparkles,
  },
  {
    title: "Teléfonos",
    description: "Samsung y Xiaomi Redmi, con garantía y buena condición.",
    icon: Smartphone,
  },
  {
    title: "Accesorios para teléfonos",
    description: "Covers y micas para proteger tu equipo.",
    icon: ShieldCheck,
  },
  {
    title: "Aseo personal",
    description: "Cremas para la piel y sprays corporales para tu día a día.",
    icon: Droplets,
  },
];

export default async function HomePage() {
  const [apiProducts, apiCombos] = await Promise.all([catalogApi.products(), catalogApi.combos()]);
  const products = apiProducts.map(productFromApi);
  const combos = apiCombos.map(comboFromApi);
  const featured = products.filter((p) => p.featured).slice(0, 4);
  const onSale = products.filter((p) => productIsOnSale(p)).slice(0, 4);
  const fallback = featured.length > 0 ? featured : products.slice(0, 4);
  const featuredCombos = combos.slice(0, 4);

  return (
    <div className="flex flex-col gap-20 pb-24">
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.15fr_1fr] md:items-center md:py-20 lg:px-8">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              <Tag className="size-3.5 text-accent" />
              Nuevo catálogo 2026
            </p>
            <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-[4.5rem]">
              Todo lo que buscas,
              <br />
              <em className="text-accent">en un solo lugar</em>.
            </h1>
            <p className="mt-6 max-w-md text-lg text-muted-foreground">
              Moda y calzado, belleza Mary Kay, teléfonos Samsung y Xiaomi Redmi, accesorios y aseo personal. Cada
              pieza curada con intención para ti.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/catalogo"
                className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Explorar catálogo
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/ofertas"
                className="inline-flex h-11 items-center gap-2 rounded-md border border-input px-6 text-sm font-medium transition-colors hover:bg-secondary"
              >
                Ver ofertas
              </Link>
            </div>
          </div>
          <div className="relative hidden aspect-[4/5] overflow-hidden rounded-xl md:block">
            <Image
              src="/hero-fashion.jpg"
              alt="Modelo vistiendo moda editorial de Cesar Fashion"
              fill
              priority
              sizes="(min-width: 768px) 45vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 text-primary-foreground">
              <span className="font-display text-2xl font-semibold italic">CF</span>
              <span className="ml-3 align-middle text-xs uppercase tracking-[0.3em] opacity-80">Cesar Fashion LLC</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="font-display text-3xl font-semibold tracking-tight">Lo que encuentras aquí</h2>
          <p className="mt-2 text-muted-foreground">Cinco líneas de producto para cubrir tu estilo y tu día a día.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {CATEGORIES.map((category) => (
            <Link
              key={category.title}
              href="/catalogo"
              className="group flex flex-col justify-between rounded-xl border bg-background p-6 transition-colors hover:border-foreground/20 hover:bg-secondary"
            >
              <category.icon className="size-6 text-accent" />
              <div className="mt-10">
                <h3 className="font-display text-lg font-semibold">{category.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight">Piezas destacadas</h2>
            <p className="mt-2 text-muted-foreground">Una selección curada de nuestro inventario.</p>
          </div>
          <Link
            href="/catalogo"
            className="hidden items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            Ver todo <ArrowRight className="size-4" />
          </Link>
        </div>
        <ProductGrid products={fallback} />
      </section>

      {/* Combos */}
      {featuredCombos.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl font-semibold tracking-tight">Combos que combinan</h2>
              <p className="mt-2 text-muted-foreground">Varias piezas en un solo precio, pensadas para ti.</p>
            </div>
            <Link
              href="/combos"
              className="hidden items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
            >
              Ver todos <ArrowRight className="size-4" />
            </Link>
          </div>
          <ComboGrid combos={featuredCombos} />
        </section>
      )}

      {/* Editorial banner */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-primary px-6 py-16 text-primary-foreground sm:px-12">
          <p className="text-xs uppercase tracking-[0.3em] opacity-70">Cesar Fashion LLC</p>
          <h2 className="mt-4 max-w-xl font-display text-3xl font-semibold leading-tight sm:text-4xl">
            Estilo, cuidado y tecnología, sin salir de aquí.
          </h2>
          <p className="mt-4 max-w-lg opacity-80">
            Una tienda que entiende lo que necesitas: viste con intención, cuida tu piel y lleva tu teléfono al día.
          </p>
        </div>
      </section>

      {/* Sale section */}
      {onSale.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-accent/30 px-3 py-1 text-xs font-medium uppercase tracking-widest text-accent">
                <Tag className="size-3.5" />
                Solo por tiempo limitado
              </p>
              <h2 className="font-display text-3xl font-semibold tracking-tight">Ofertas destacadas</h2>
            </div>
            <Link
              href="/ofertas"
              className="hidden items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-accent/80 sm:inline-flex"
            >
              Ver todas las ofertas <ArrowRight className="size-4" />
            </Link>
          </div>
          <ProductGrid products={onSale} />
        </section>
      )}
    </div>
  );
}
