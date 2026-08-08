import Link from "next/link";
import { CreditCard, MessageCircle, ShieldCheck, Truck } from "lucide-react";
import { NewsletterForm } from "./newsletter-form";
import { InstagramIcon, TikTokIcon } from "./social-icons";

const WHATSAPP_URL = "https://wa.me/17372689835";

const SHOP_LINKS = [
  { label: "Catálogo", href: "/catalogo" },
  { label: "Combos", href: "/combos" },
  { label: "Ofertas", href: "/ofertas" },
];

const HELP_LINKS = [
  { label: "Cómo comprar", href: "/ayuda#como-comprar" },
  { label: "Finalizar pedido", href: "/ayuda#finalizar-pedido" },
  { label: "Envíos y entregas", href: "/ayuda#envios-y-entregas" },
];

const ACCOUNT_LINKS = [
  { label: "Iniciar sesión", href: "/login" },
  { label: "Crear cuenta", href: "/register" },
];

function FooterColumn({
  title,
  links,
  className,
}: {
  title: string;
  links: { label: string; href: string; external?: boolean }[];
  className?: string;
}) {
  return (
    <nav aria-label={title} className={className}>
      <h3 className="font-display text-sm font-semibold tracking-tight">{title}</h3>
      <ul className="mt-4 flex flex-col gap-3">
        {links.map((link) => (
          <li key={link.label}>
            {link.external ? (
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ) : (
              <Link
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t bg-secondary/60">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        {/* Columns */}
        <div className="grid gap-x-8 gap-y-10 py-12 sm:grid-cols-2 lg:grid-cols-12">
          <div className="flex flex-col items-start sm:col-span-2 lg:col-span-4">
            <p className="font-display text-xl font-semibold tracking-tight">
              Cesar Fashion<span className="text-accent-strong">LLC</span>
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Boutique editorial de moda, belleza y tecnología, con cada pieza curada con intención.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href="#"
                aria-label="Instagram de Cesar Fashion"
                className="inline-flex size-11 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-accent/40 hover:text-accent"
              >
                <InstagramIcon className="size-5" />
              </a>
              <a
                href="#"
                aria-label="TikTok de Cesar Fashion"
                className="inline-flex size-11 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-accent/40 hover:text-accent"
              >
                <TikTokIcon className="size-5" />
              </a>
            </div>
          </div>

          <FooterColumn title="Tienda" links={SHOP_LINKS} className="lg:col-span-2" />
          <FooterColumn title="Ayuda" links={HELP_LINKS} className="lg:col-span-2" />
          <FooterColumn title="Cuenta" links={ACCOUNT_LINKS} className="lg:col-span-2" />

          <nav aria-label="Contacto" className="lg:col-span-2">
            <h3 className="font-display text-sm font-semibold tracking-tight">Contacto</h3>
            <ul className="mt-4 flex flex-col gap-3">
              <li>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <MessageCircle className="size-4 text-accent" />
                  +1 737 268 9835
                </a>
              </li>
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              Coordinamos la entrega y el pago directamente contigo.
            </p>
          </nav>
        </div>

        {/* Envío y pago */}
        <div className="border-t pt-10">
          <ul className="grid gap-6 sm:grid-cols-3">
            <li className="flex items-start gap-3">
              <Truck className="mt-0.5 size-5 shrink-0 text-accent" />
              <div>
                <p className="text-sm font-medium">Envío coordinado</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Acordamos la entrega directamente contigo.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CreditCard className="mt-0.5 size-5 shrink-0 text-accent" />
              <div>
                <p className="text-sm font-medium">Pago directo</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Confirmamos el método de pago al coordinar tu pedido.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-accent" />
              <div>
                <p className="text-sm font-medium">Stock reservado</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Guardamos tus piezas por 24 horas al confirmar.
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* Barra final */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} kr4t3r<span className="text-accent-strong">dev</span>. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
