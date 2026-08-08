import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, CreditCard, MessageCircle, ShieldCheck, Truck } from "lucide-react";

export const metadata: Metadata = {
  title: "Ayuda — Cesar Fashion",
  description:
    "Resolvemos tus dudas: cómo comprar, cómo finalizar tu pedido y cómo funcionan los envíos y entregas de Cesar Fashion.",
};

const WHATSAPP_URL = "https://wa.me/17372689835";

const NAV_LINKS = [
  { label: "Cómo comprar", href: "#como-comprar" },
  { label: "Finalizar pedido", href: "#finalizar-pedido" },
  { label: "Envíos y entregas", href: "#envios-y-entregas" },
];

const BUY_STEPS = [
  {
    title: "Explora el catálogo",
    body: "Navega por el catálogo, los combos y las ofertas para descubrir las piezas disponibles. Cada producto muestra su precio y sus fotos.",
  },
  {
    title: "Añade al carrito",
    body: "Elige la talla o cantidad que prefieras y agrégalo a tu carrito. También puedes incluir combos a la vez.",
  },
  {
    title: "Revisa tu carrito",
    body: "Abre tu carrito para ajustar cantidades, quitar piezas o ver el total de tu pedido antes de continuar.",
  },
  {
    title: "Finaliza tu pedido",
    body: "Pulsa «Finalizar pedido». Necesitarás una cuenta activa; si aún no tienes una, puedes crearla en un momento y tu carrito se conserva.",
  },
  {
    title: "Coordina el pago y la entrega",
    body: "Tras confirmar, te contactamos directamente para coordinar el método de pago y la entrega. No cobramos el pedido hasta acordarlo contigo.",
  },
];

const CHECKOUT_STEPS = [
  {
    title: "Abre el carrito",
    body: "Pulsa el ícono del carrito en la parte superior y después el botón «Finalizar pedido».",
  },
  {
    title: "Inicia sesión o crea una cuenta",
    body: "Para pedir necesitas una cuenta activa. Si tu cuenta está pendiente de activación, tu carrito se conserva hasta que el administrador la active.",
  },
  {
    title: "Completa tus datos",
    body: "Escribe tu nombre, teléfono y email. En la nota opcional puedes dejar talla, dirección, horario de entrega o cualquier detalle.",
  },
  {
    title: "Confirma el pedido",
    body: "Revisa el resumen con el total y pulsa «Confirmar pedido». Recibirás un número de referencia para tu pedido.",
  },
  {
    title: "Reserva y coordinación",
    body: "Al confirmar, reservamos tu stock por 24 horas mientras coordinamos el pago y la entrega contigo.",
  },
];

function StepList({ steps }: { steps: { title: string; body: string }[] }) {
  return (
    <ol className="flex flex-col gap-5">
      {steps.map((step, index) => (
        <li key={step.title} className="flex gap-4">
          <span className="font-display mt-0.5 text-lg font-semibold text-accent">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div>
            <h3 className="font-display text-lg font-medium">{step.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function AyudaPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Ayuda</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Centro de ayuda
        </h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          Todo lo que necesitas saber para comprar con confianza en Cesar Fashion.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[240px_1fr] lg:items-start">
        <nav
          aria-label="Temas de ayuda"
          className="flex gap-2 overflow-x-auto lg:sticky lg:top-24 lg:flex-col lg:overflow-visible"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground lg:whitespace-normal"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex min-w-0 flex-col gap-16">
          <section id="como-comprar" className="scroll-mt-28">
            <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-accent/30 px-3 py-1 text-xs font-medium uppercase tracking-widest text-accent">
              Guía rápida
            </p>
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Cómo comprar
            </h2>
            <p className="mt-2 max-w-lg text-muted-foreground">
              Comprar en Cesar Fashion es sencillo: eliges tus piezas, confirmas tu pedido y
              coordinamos la entrega contigo.
            </p>
            <div className="mt-8">
              <StepList steps={BUY_STEPS} />
            </div>
            <Link
              href="/catalogo"
              className="mt-8 inline-flex h-12 items-center gap-2 rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Explorar el catálogo <ArrowRight className="size-4" />
            </Link>
          </section>

          <section id="finalizar-pedido" className="scroll-mt-28">
            <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-accent/30 px-3 py-1 text-xs font-medium uppercase tracking-widest text-accent">
              Paso a paso
            </p>
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Finalizar pedido
            </h2>
            <p className="mt-2 max-w-lg text-muted-foreground">
              Desde tu carrito hasta la confirmación, así de fácil es completar tu compra.
            </p>
            <div className="mt-8">
              <StepList steps={CHECKOUT_STEPS} />
            </div>
          </section>

          <section id="envios-y-entregas" className="scroll-mt-28">
            <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-accent/30 px-3 py-1 text-xs font-medium uppercase tracking-widest text-accent">
              Logística
            </p>
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Envíos y entregas
            </h2>
            <p className="mt-2 max-w-lg text-muted-foreground">
              Cada entrega se coordina de forma personalizada para que recibas tus piezas cuando
              mejor te convenga.
            </p>
            <ul className="mt-8 flex flex-col gap-6">
              <li className="flex items-start gap-4 rounded-xl border bg-card p-6">
                <Truck className="mt-0.5 size-5 shrink-0 text-accent" />
                <div>
                  <h3 className="font-display text-lg font-medium">Envío coordinado</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Tras confirmar tu pedido, acordamos la entrega directamente contigo por WhatsApp
                    o teléfono, eligiendo día y lugar.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4 rounded-xl border bg-card p-6">
                <CreditCard className="mt-0.5 size-5 shrink-0 text-accent" />
                <div>
                  <h3 className="font-display text-lg font-medium">Pago directo</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Confirmamos el método de pago al coordinar tu pedido. No cargamos nada hasta que
                    ambos lo acordamos.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4 rounded-xl border bg-card p-6">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-accent" />
                <div>
                  <h3 className="font-display text-lg font-medium">Stock reservado</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Al confirmar tu pedido guardamos tus piezas por 24 horas mientras coordinamos el
                    pago y la entrega.
                  </p>
                </div>
              </li>
            </ul>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex h-12 items-center gap-2 rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <MessageCircle className="size-4" />
              Coordinar entrega por WhatsApp
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
