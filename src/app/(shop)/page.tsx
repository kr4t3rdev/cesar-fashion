import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Tag } from "lucide-react";
import { ProductGrid } from "@/components/shop/product-grid";
import { productService } from "@/server/application/product-service";
import { productIsOnSale } from "@/server/domain/product";

export const metadata = {
  title: "Moda Editorial — Cesar Fashion LLC",
};

export default async function HomePage() {
  const products = await productService.listProducts();
  const featured = products.filter((p) => p.featured).slice(0, 4);
  const onSale = products.filter((p) => productIsOnSale(p)).slice(0, 4);
  const fallback = featured.length > 0 ? featured : products.slice(0, 4);

  return (
    <div className="flex flex-col gap-20 pb-24">
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.15fr_1fr] md:items-center md:py-20 lg:px-8">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              <Tag className="size-3.5 text-accent" />
              Nueva colección 2026
            </p>
            <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-[4.5rem]">
              Viste con
              <br />
              <em className="text-accent">intención</em>.
            </h1>
            <p className="mt-6 max-w-md text-lg text-muted-foreground">
              Piezas seleccionadas de alta calidad para quienes entienden la moda como una declaración.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/catalogo"
                className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Explorar colección
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

      {/* Featured products */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight">Piezas destacadas</h2>
            <p className="mt-2 text-muted-foreground">Una selección curada de nuestra colección.</p>
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

      {/* Editorial banner */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-primary px-6 py-16 text-primary-foreground sm:px-12">
          <p className="text-xs uppercase tracking-[0.3em] opacity-70">Cesar Fashion LLC</p>
          <h2 className="mt-4 max-w-xl font-display text-3xl font-semibold leading-tight sm:text-4xl">
            La elegancia no se anuncia, se lleva.
          </h2>
          <p className="mt-4 max-w-lg opacity-80">
            Materiales nobles, cortes pensados y una curaduría que trasciende tendencias.
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
