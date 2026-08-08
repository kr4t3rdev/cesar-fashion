"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterForm() {
  const [subscribed, setSubscribed] = useState(false);

  if (subscribed) {
    return (
      <p className="w-full max-w-md rounded-md border border-success/30 bg-success/10 px-4 py-3 text-sm">
        ¡Listo! Te avisaremos cuando haya novedades.
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubscribed(true);
      }}
      className="flex w-full max-w-md flex-col gap-2 sm:flex-row"
    >
      <Input
        type="email"
        name="email"
        placeholder="tu@correo.com"
        aria-label="Tu correo para recibir novedades"
        required
        autoComplete="email"
        className="h-11 bg-background"
      />
      <Button type="submit" className="h-11 shrink-0 px-5">
        <Send className="size-4" />
        Suscribirme
      </Button>
    </form>
  );
}
