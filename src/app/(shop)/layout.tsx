import { CartProvider } from "@/components/shop/cart/cart-context";
import { CartDrawer } from "@/components/shop/cart/cart-drawer";
import { SiteHeader } from "@/components/shop/site-header";
import { SiteFooter } from "@/components/shop/site-footer";

export default function ShopLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <CartProvider>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <CartDrawer />
      <SiteFooter />
    </CartProvider>
  );
}
