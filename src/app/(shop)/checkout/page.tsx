import type { Metadata } from "next";
import { CheckoutForm } from "@/components/shop/checkout-form";
import { CheckoutGate } from "@/components/shop/checkout-gate";
import { getServerUser, isActiveUser } from "@/lib/api/server-auth";

export const metadata: Metadata = {
  title: "Finalizar pedido — Cesar Fashion",
};

export default async function CheckoutPage() {
  const user = await getServerUser();

  if (!user) {
    return <CheckoutGate status="guest" />;
  }

  if (!isActiveUser(user)) {
    return <CheckoutGate status={user.status === "disabled" ? "disabled" : "pending"} />;
  }

  return <CheckoutForm />;
}
