import { ComboCard } from "@/components/shop/combo-card";
import type { ComboEntity } from "@/lib/domain/combo";

export function ComboGrid({ combos }: { combos: ComboEntity[] }) {
  if (combos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
        <p className="font-display text-lg font-semibold">Sin combos</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Aún no hay combos en esta sección. Vuelve pronto.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
      {combos.map((combo) => (
        <ComboCard key={combo.id} combo={combo} />
      ))}
    </div>
  );
}
