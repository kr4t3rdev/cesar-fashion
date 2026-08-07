"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, Users, ShoppingBag, Boxes, ReceiptText, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Inventario", icon: Package, exact: true },
  { href: "/admin/pedidos", label: "Pedidos", icon: ReceiptText },
  { href: "/admin/combos", label: "Combos", icon: ShoppingBag },
  { href: "/admin/mayoreo", label: "Por mayor", icon: Boxes },
];

export function AdminNav({ isAdmin }: { isAdmin?: boolean }) {
  const pathname = usePathname();

  const links = isAdmin
    ? [...LINKS, { href: "/admin/usuarios", label: "Usuarios", icon: Users }]
    : LINKS;

  return (
    <nav className="mb-6 flex flex-col gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-1 text-sm font-medium">
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex items-center gap-2 rounded-md px-3 py-1.5 transition-colors",
                active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className="size-4 text-accent" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
      <div className="flex items-center gap-4">
        <Link href="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
          Tienda
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-destructive"
        >
          <LogOut className="size-4" />
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}
