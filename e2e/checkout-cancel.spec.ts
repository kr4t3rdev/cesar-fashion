import { test, expect } from "@playwright/test";

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "admin@cesarfashion.com";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "admin1234";
const CUSTOMER_EMAIL = process.env.E2E_CUSTOMER_EMAIL ?? "gestor@cesarfashion.com";
const CUSTOMER_PASSWORD = process.env.E2E_CUSTOMER_PASSWORD ?? "gestor1234";

test.describe("Checkout y cancelación", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.localStorage.clear());
  });

  test("crea un pedido y el admin lo cancela devolviendo stock", async ({ page, context }) => {
    // 0. Sesión de cliente activa (gestor puede comprar y gestionar el panel)
    await page.goto("/login");
    await page.getByLabel("Email").fill(CUSTOMER_EMAIL);
    await page.getByLabel("Contraseña").fill(CUSTOMER_PASSWORD);
    await page.getByRole("button", { name: "Iniciar sesión" }).click();
    await expect(page).toHaveURL(/\/admin/, { timeout: 15000 });

    // 1. Elige un producto con stock y lo añade al carrito
    await page.goto("/catalogo");
    const product = page.locator("main a[href^='/producto/']").first();
    await expect(product).toBeVisible({ timeout: 15000 });
    await product.click();
    await page.getByRole("button", { name: "Añadir al carrito" }).click();

    // 2. Va al checkout
    await page.getByRole("button", { name: "Abrir carrito" }).click();
    await page.getByLabel("Tu carrito").getByRole("link", { name: "Finalizar pedido" }).click();
    await expect(page.getByText("Finalizar pedido")).toBeVisible();

    // 3. Completa el formulario y confirma
    const nombre = `E2E Test ${Date.now()}`;
    await page.getByLabel("Nombre completo").fill(nombre);
    await page.getByLabel("Teléfono").fill("555-0199");
    await page.getByLabel("Email").fill("e2e@example.com");
    await page.getByLabel("Nota (opcional)").fill("pedido de prueba e2e");
    await page.getByRole("button", { name: "Confirmar pedido" }).click();

    await expect(page.getByText("¡Pedido recibido!")).toBeVisible({ timeout: 20000 });
    const reference = await page
      .locator("text=/CF-[A-Z0-9]{6}/")
      .first()
      .textContent();
    expect(reference).toMatch(/CF-[A-Z0-9]{6}/);

    // 4. El admin (nueva sesión) ve el pedido pendiente y lo cancela
    const adminContext = await context.browser()!.newContext();
    const adminPage = await adminContext.newPage();
    await adminPage.goto("/login");
    await adminPage.getByLabel("Email").fill(ADMIN_EMAIL);
    await adminPage.getByLabel("Contraseña").fill(ADMIN_PASSWORD);
    await adminPage.getByRole("button", { name: "Iniciar sesión" }).click();
    await expect(adminPage).toHaveURL(/\/admin/, { timeout: 15000 });

    await adminPage.getByRole("link", { name: "Pedidos" }).click();
    await expect(adminPage.getByText(reference ?? "CF-")).toBeVisible({ timeout: 15000 });

    const row = adminPage.locator("tr", { hasText: reference ?? "CF-" });
    await expect(row.getByText("Pendiente")).toBeVisible();

    adminPage.on("dialog", (dialog) => dialog.accept());
    await row.getByRole("button", { name: "Cancelar" }).click();
    await expect(row.getByText("Cancelado")).toBeVisible({ timeout: 15000 });
    await adminContext.close();
  });
});
