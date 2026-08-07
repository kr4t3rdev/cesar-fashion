import Image from "next/image";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { AddToCartButton } from "@/components/shop/add-to-cart-button";
import { productService } from "@/server/application/product-service";
import { productDiscountPercent, productEffectivePrice } from "@/server/domain/product";
import { formatCurrency } from "@/lib/utils";

const FALLBACK_IMAGE = "/placeholder-product.svg";

export const metadata = {
  title: "Producto",
};

export const dynamic = "force-dynamic";

export default async function ProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await productService.getProduct(id);
  if (!product) notFound();

  const isOnSale = product.isOnSale && product.salePrice !== null;
  const discount = productDiscountPercent(product);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-secondary">
          <Image
            src={product.imageUrl ?? FALLBACK_IMAGE}
            alt={product.name}
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
          {isOnSale && (
            <div className="absolute left-4 top-4 flex flex-col gap-2">
              <Badge variant="sale">-{discount}%</Badge>
              {product.saleLabel && <Badge variant="secondary">{product.saleLabel}</Badge>}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{product.category}</p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">{product.name}</h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{product.description}</p>

          <div className="mt-8 flex items-baseline gap-3">
            {isOnSale && product.salePrice !== null ? (
              <>
                <span className="text-3xl font-semibold text-accent">
                  {formatCurrency(product.salePrice, product.currency)}
                </span>
                <span className="text-xl text-muted-foreground line-through">
                  {formatCurrency(product.price, product.currency)}
                </span>
                <Badge variant="sale">Ahorras {formatCurrency(product.price - product.salePrice, product.currency)}</Badge>
              </>
            ) : (
              <span className="text-3xl font-semibold">{formatCurrency(product.price, product.currency)}</span>
            )}
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            {product.stock > 0 ? (
              <>
                En stock — <span className="font-medium text-foreground">{product.stock} unidades disponibles</span>
              </>
            ) : (
              <span className="font-medium text-destructive">Agotado</span>
            )}
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <AddToCartButton
              label="Añadir al carrito"
              item={{
                kind: "product",
                id: product.id,
                name: product.name,
                imageUrl: product.imageUrl,
                unitPrice: productEffectivePrice(product),
                currency: product.currency,
                maxQuantity: product.stock,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
