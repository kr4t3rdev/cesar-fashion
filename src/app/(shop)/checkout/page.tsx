import type { Metadata } from "next";
import { auth } from "@/auth";
import { CheckoutForm } from "@/components/shop/checkout-form";
import { CheckoutGate } from "@/components/shop/checkout-gate";
import { isActiveUser } from "@/server/application/roles";

export const metadata: Metadata = {
  title: "Finalizar pedido — Cesar Fashion",
};

export default async function CheckoutPage() {
  const session = await auth();

  if (!session?.user) {
    return <CheckoutGate status="guest" />;
  }

  const status = session.user.status ?? "pending";
  if (!isActiveUser(session)) {
    return <CheckoutGate status={status === "disabled" ? "disabled" : "pending"} />;
  }

  return <CheckoutForm />;
}
