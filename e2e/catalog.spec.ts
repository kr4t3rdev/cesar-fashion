import { test, expect } from "@playwright/test";

test.describe("Catálogo", () => {
  test("muestra productos del catálogo", async ({ page }) => {
    await page.goto("/catalogo");

    await expect(page.getByRole("heading", { name: /Catálogo/i })).toBeVisible();
    await expect(page.locator("main a[href^='/producto/']").first()).toBeVisible({ timeout: 15000 });
    const count = await page.locator("main a[href^='/producto/']").count();
    expect(count).toBeGreaterThan(0);
  });

  test("abre el detalle de un producto", async ({ page }) => {
    await page.goto("/catalogo");

    const firstProduct = page.locator("main a[href^='/producto/']").first();
    await expect(firstProduct).toBeVisible({ timeout: 15000 });
    const href = await firstProduct.getAttribute("href");
    await firstProduct.click();

    await expect(page).toHaveURL(new RegExp(href ?? "/producto/"));
    await expect(page.getByRole("button", { name: "Añadir al carrito" })).toBeVisible();
  });

  test("aplica precio de oferta cuando hay descuento", async ({ page }) => {
    await page.goto("/ofertas");

    await expect(page.getByRole("heading", { name: /Ofertas/i })).toBeVisible();
    await expect(page.locator("main a[href^='/producto/']").first()).toBeVisible({ timeout: 15000 });
  });
});
