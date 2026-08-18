"use client";

import { useState } from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Pencil, Trash2, Tag, BadgePercent, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toggleSaleAction, deleteProductAction } from "@/lib/api/actions";
import { EditProductForm } from "@/components/admin/edit-product-form";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ProductEntity } from "@/lib/domain/product";

const FALLBACK_IMAGE = "/placeholder-product.svg";

function ToggleSaleButton({ product }: { product: ProductEntity }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          await toggleSaleAction(new FormData(e.currentTarget));
          router.refresh();
        });
      }}
    >
      <input type="hidden" name="id" value={product.id} />
      <Button
        type="submit"
        variant={product.isOnSale ? "outline" : "ghost"}
        size="sm"
        disabled={pending}
        title={product.isOnSale ? "Quitar de ofertas" : "Poner en oferta"}
        className={product.isOnSale ? "border-accent/40 text-accent hover:bg-accent/10" : ""}
      >
        {pending ? <Loader2 className="animate-spin" /> : product.isOnSale ? <BadgePercent className="size-4" /> : <Tag className="size-4" />}
        {product.isOnSale ? "Quitar" : "Oferta"}
      </Button>
    </form>
  );
}

function DeleteButton({ product }: { product: ProductEntity }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`)) return;
        startTransition(async () => {
          await deleteProductAction(new FormData(e.currentTarget));
          router.refresh();
        });
      }}
    >
      <input type="hidden" name="id" value={product.id} />
      <Button type="submit" variant="ghost" size="icon" disabled={pending} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
        {pending ? <Loader2 className="animate-spin" /> : <Trash2 className="size-4" />}
      </Button>
    </form>
  );
}

function EditDialog({ product }: { product: ProductEntity }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-secondary">
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar producto</DialogTitle>
          <DialogDescription>Actualiza los datos del producto y guarda los cambios.</DialogDescription>
        </DialogHeader>
        <EditProductForm product={product} onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

export function InventoryTable({ products }: { products: ProductEntity[] }) {
  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div>
          <h2 className="font-display text-lg font-semibold">Inventario de productos</h2>
          <p className="text-xs text-muted-foreground">
            {products.length} {products.length === 1 ? "producto" : "productos"} en total ·{" "}
            {products.filter((p) => p.isOnSale).length} en oferta
          </p>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-16">Imagen</TableHead>
            <TableHead>Producto</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead className="text-right">Precio</TableHead>
            <TableHead className="text-right">Oferta</TableHead>
            <TableHead className="text-center">Stock</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                No hay productos todavía. Añade el primero con el formulario.
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="relative size-10 overflow-hidden rounded-md bg-secondary">
                    <Image
                      src={product.imageUrl ?? FALLBACK_IMAGE}
                      alt={product.name}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{product.name}</div>
                  <div className="text-xs text-muted-foreground">{formatDate(product.createdAt)}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{product.category}</Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(product.price, product.currency)}
                </TableCell>
                <TableCell className="text-right">
                  {product.salePrice !== null && product.isOnSale ? (
                    <span className="font-medium text-accent">
                      {formatCurrency(product.salePrice, product.currency)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={product.stock > 0 ? "secondary" : "destructive"}>
                    {product.stock > 0 ? `${product.stock} uds` : "Agotado"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {product.isOnSale && <Badge variant="sale">Oferta</Badge>}
                    {product.featured && <Badge variant="outline">Destacado</Badge>}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <EditDialog product={product} />
                    <ToggleSaleButton product={product} />
                    <DeleteButton product={product} />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
