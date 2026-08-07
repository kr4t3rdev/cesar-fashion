import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { comboAvailable, comboDiscountPercent, comboTotalUnits, type ComboEntity } from "@/server/domain/combo";
import { formatCurrency } from "@/lib/utils";

const FALLBACK_IMAGE = "/placeholder-product.svg";

export function ComboCard({ combo }: { combo: ComboEntity }) {
  const discount = comboDiscountPercent(combo);
  const isOnSale = combo.isOnSale && combo.salePrice !== null;
  const available = comboAvailable(combo);

  return (
    <Link
      href={`/combos/${combo.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-all hover:border-foreground/20 hover:shadow-lg"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
        <Image
          src={combo.imageUrl ?? FALLBACK_IMAGE}
          alt={combo.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {isOnSale && discount !== null && <Badge variant="sale">-{discount}%</Badge>}
          {combo.saleLabel && isOnSale && <Badge variant="secondary">{combo.saleLabel}</Badge>}
          {!available && <Badge variant="destructive">Agotado</Badge>}
        </div>
        <div className="absolute bottom-3 right-3">
          <Badge variant="secondary">
            {comboTotalUnits(combo.items)} piezas · {combo.items.length} {combo.items.length === 1 ? "producto" : "productos"}
          </Badge>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Combo</p>
        <h3 className="font-display text-lg font-semibold leading-snug">{combo.name}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">{combo.description}</p>
        <div className="mt-auto flex items-baseline gap-2 pt-3">
          {isOnSale && combo.salePrice !== null ? (
            <>
              <span className="text-lg font-semibold text-accent">{formatCurrency(combo.salePrice, combo.currency)}</span>
              <span className="text-sm text-muted-foreground line-through">{formatCurrency(combo.price, combo.currency)}</span>
            </>
          ) : (
            <span className="text-lg font-semibold">{formatCurrency(combo.price, combo.currency)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
