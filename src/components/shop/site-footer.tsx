import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:px-6 md:flex-row lg:px-8">
        <p className="font-display text-sm font-semibold">
          Cesar Fashion <span className="text-accent">LLC</span>
        </p>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Cesar Fashion LLC. Todos los derechos reservados.
        </p>
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
