import { ComboGrid } from "@/components/shop/combo-grid";
import { comboService } from "@/server/application/combo-service";

export const metadata = {
  title: "Combos",
};

export default async function CombosPage() {
  const combos = await comboService.listCombos();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Ahorra en conjunto</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Combos</h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          Varias piezas seleccionadas que se venden como una sola, a un mejor precio.
        </p>
      </div>
      <ComboGrid combos={combos} />
    </div>
  );
}
