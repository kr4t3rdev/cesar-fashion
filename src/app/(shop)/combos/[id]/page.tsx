import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { comboService } from "@/server/application/combo-service";
import { comboAvailable, comboDiscountPercent, comboTotalUnits, type ComboEntity } from "@/server/domain/combo";
import { formatCurrency } from "@/lib/utils";

const FALLBACK_IMAGE = "/placeholder-product.svg";

export const metadata = {
  title: "Combo",
};

async function getCombo(id: string): Promise<ComboEntity | null> {
  try {
    return await comboService.getCombo(id);
  } catch {
    return null;
  }
}

export default async function ComboDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const combo = await getCombo(id);
  if (!combo || !combo.isActive) notFound();

  const isOnSale = combo.isOnSale && combo.salePrice !== null;
  const discount = comboDiscountPercent(combo);
  const available = comboAvailable(combo);
  const componentsTotal = combo.items.reduce((acc, i) => acc + i.product.price * i.quantity, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-secondary">
          <Image
            src={combo.imageUrl ?? FALLBACK_IMAGE}
            alt={combo.name}
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
          {isOnSale && discount !== null && (
            <div className="absolute left-4 top-4 flex flex-col gap-2">
              <Badge variant="sale">-{discount}%</Badge>
              {combo.saleLabel && <Badge variant="secondary">{combo.saleLabel}</Badge>}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Combo · {comboTotalUnits(combo.items)} piezas</p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">{combo.name}</h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{combo.description}</p>

          <div className="mt-8 flex items-baseline gap-3">
            {isOnSale && combo.salePrice !== null ? (
              <>
                <span className="text-3xl font-semibold text-accent">{formatCurrency(combo.salePrice, combo.currency)}</span>
                <span className="text-xl text-muted-foreground line-through">{formatCurrency(combo.price, combo.currency)}</span>
                <Badge variant="sale">Ahorras {formatCurrency(combo.price - combo.salePrice, combo.currency)}</Badge>
              </>
            ) : (
              <span className="text-3xl font-semibold">{formatCurrency(combo.price, combo.currency)}</span>
            )}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Valor de las piezas por separado: <span className="font-medium text-foreground">{formatCurrency(componentsTotal, combo.currency)}</span>
          </p>

          <p className="mt-4 text-sm text-muted-foreground">
            {available ? (
              <span className="font-medium text-foreground">Disponible en stock</span>
            ) : (
              <span className="font-medium text-destructive">Agotado</span>
            )}
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <button
              disabled={!available}
              className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
            >
              Añadir al carrito
            </button>
          </div>

          <div className="mt-10">
            <h2 className="font-display text-lg font-semibold">Incluye</h2>
            <ul className="mt-4 flex flex-col gap-3">
              {combo.items.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-4 rounded-lg border bg-card px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative size-12 overflow-hidden rounded-md bg-secondary">
                      <Image
                        src={item.product.imageUrl ?? FALLBACK_IMAGE}
                        alt={item.product.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <Link
                        href={`/producto/${item.product.id}`}
                        className="font-medium transition-colors hover:text-accent"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">× {item.quantity}</p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatCurrency(item.product.price * item.quantity, item.product.currency)}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <Link
            href="/combos"
            className="mt-8 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Ver todos los combos <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
