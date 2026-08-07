import type { Metadata } from "next";
import { CheckoutForm } from "@/components/shop/checkout-form";

export const metadata: Metadata = {
  title: "Finalizar pedido — Cesar Fashion",
};

export default function CheckoutPage() {
  return <CheckoutForm />;
}
