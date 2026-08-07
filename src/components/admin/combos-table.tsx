"use client";

import { useState } from "react";
import { useTransition } from "react";
import Image from "next/image";
import { Pencil, Trash2, Loader2, Eye, EyeOff } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toggleComboAction, deleteComboAction } from "@/server/application/combo-actions";
import { EditComboForm } from "@/components/admin/edit-combo-form";
import { formatCurrency, formatDate } from "@/lib/utils";
import { comboAvailable, comboTotalUnits, type ComboEntity } from "@/server/domain/combo";
import type { ComboProductOption } from "@/components/admin/combo-form";

const FALLBACK_IMAGE = "/placeholder-product.svg";

function ToggleButton({ combo }: { combo: ComboEntity }) {
  const [pending, startTransition] = useTransition();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          await toggleComboAction(new FormData(e.currentTarget));
        });
      }}
    >
      <input type="hidden" name="id" value={combo.id} />
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        disabled={pending}
        aria-label={combo.isActive ? `Ocultar combo ${combo.name}` : `Mostrar combo ${combo.name}`}
        title={combo.isActive ? "Desactivar combo" : "Activar combo"}
        className={combo.isActive ? "text-muted-foreground hover:text-foreground" : "text-accent hover:text-accent"}
      >
        {pending ? <Loader2 className="animate-spin" /> : combo.isActive ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        {combo.isActive ? "Ocultar" : "Mostrar"}
      </Button>
    </form>
  );
}

function DeleteButton({ combo }: { combo: ComboEntity }) {
  const [pending, startTransition] = useTransition();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!confirm(`¿Eliminar el combo "${combo.name}"? Esta acción no se puede deshacer.`)) return;
        startTransition(async () => {
          await deleteComboAction(new FormData(e.currentTarget));
        });
      }}
    >
      <input type="hidden" name="id" value={combo.id} />
      <Button type="submit" variant="ghost" size="icon" disabled={pending} aria-label={`Eliminar combo ${combo.name}`} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
        {pending ? <Loader2 className="animate-spin" /> : <Trash2 className="size-4" />}
      </Button>
    </form>
  );
}

function EditDialog({ combo, products }: { combo: ComboEntity; products: ComboProductOption[] }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Editar combo ${combo.name}`} className="hover:bg-secondary">
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar combo</DialogTitle>
          <DialogDescription>Actualiza los productos incluidos y el precio del combo.</DialogDescription>
        </DialogHeader>
        <EditComboForm combo={combo} products={products} onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

export function CombosTable({ combos, products }: { combos: ComboEntity[]; products: ComboProductOption[] }) {
  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div>
          <h2 className="font-display text-lg font-semibold">Combos</h2>
          <p className="text-xs text-muted-foreground">
            {combos.length} {combos.length === 1 ? "combo" : "combos"} ·{" "}
            {combos.filter((c) => c.isActive).length} visibles en tienda
          </p>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-16">Imagen</TableHead>
            <TableHead>Combo</TableHead>
            <TableHead className="text-right">Precio</TableHead>
            <TableHead className="text-right">Oferta</TableHead>
            <TableHead>Disponibilidad</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {combos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                No hay combos todavía. Crea el primero con el formulario.
              </TableCell>
            </TableRow>
          ) : (
            combos.map((combo) => {
              const available = comboAvailable(combo);
              return (
                <TableRow key={combo.id}>
                  <TableCell>
                    <div className="relative size-10 overflow-hidden rounded-md bg-secondary">
                      <Image src={combo.imageUrl ?? FALLBACK_IMAGE} alt={combo.name} fill sizes="40px" className="object-cover" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{combo.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {comboTotalUnits(combo.items)} piezas · {combo.items.length} {combo.items.length === 1 ? "producto" : "productos"} ·{" "}
                      {formatDate(combo.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(combo.price, combo.currency)}</TableCell>
                  <TableCell className="text-right">
                    {combo.salePrice !== null && combo.isOnSale ? (
                      <span className="font-medium text-accent">{formatCurrency(combo.salePrice, combo.currency)}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={available ? "secondary" : "destructive"}>{available ? "Disponible" : "Sin stock"}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {!combo.isActive && <Badge variant="outline">Oculto</Badge>}
                      {combo.isOnSale && <Badge variant="sale">Oferta</Badge>}
                      {combo.featured && <Badge variant="outline">Destacado</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <EditDialog combo={combo} products={products} />
                      <ToggleButton combo={combo} />
                      <DeleteButton combo={combo} />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
