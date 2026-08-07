import Link from "next/link";
import { Package, LogOut } from "lucide-react";
import { signOut } from "@/auth";

export function AdminNav() {
  return (
    <nav className="mb-6 flex items-center justify-between rounded-xl border bg-card px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Package className="size-4 text-accent" />
        <span>Gestión de inventario</span>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
          Tienda
        </Link>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button type="submit" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-destructive">
            <LogOut className="size-4" />
            Cerrar sesión
          </button>
        </form>
      </div>
    </nav>
  );
}
