import Link from "next/link";
import { auth } from "@/auth";
import { MobileMenu } from "./mobile-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { CartButton } from "@/components/shop/cart/cart-button";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { isStaff } from "@/server/application/roles";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/combos", label: "Combos" },
  { href: "/ofertas", label: "Ofertas" },
];

export async function SiteHeader() {
  const session = await auth();
  const isStaffRole = isStaff(session);
  const isCustomer = !!session?.user && !isStaffRole;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <MobileMenu />
          <Link href="/" className="font-display text-xl font-semibold tracking-tight">
            Cesar Fashion
            <span className="text-accent">.</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <CartButton />
          <ThemeToggle />
          {isStaffRole ? (
            <Link
              href="/admin"
              className="inline-flex h-11 items-center rounded-md border border-primary bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Dashboard
            </Link>
          ) : isCustomer ? (
            <SignOutButton />
          ) : (
            <Link
              href="/login"
              className="inline-flex h-11 items-center rounded-md border border-input px-4 text-sm font-medium transition-colors hover:bg-secondary"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
