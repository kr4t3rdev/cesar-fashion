import { test, expect } from "@playwright/test";

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "admin@cesarfashion.com";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "admin1234";

test.describe("Login", () => {
  test("loguea un administrador y redirige al panel", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill(ADMIN_EMAIL);
    await page.getByLabel("Contraseña").fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Iniciar sesión" }).click();

    await expect(page).toHaveURL(/\/admin/, { timeout: 15000 });
    await expect(page.getByRole("link", { name: "Inventario" })).toBeVisible();
  });

  test("rechaza credenciales incorrectas", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill(ADMIN_EMAIL);
    await page.getByLabel("Contraseña").fill("clave-incorrecta");
    await page.getByRole("button", { name: "Iniciar sesión" }).click();

    await expect(page.getByText("Credenciales incorrectas")).toBeVisible();
  });

  test("redirige a /admin si ya hay sesión", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(ADMIN_EMAIL);
    await page.getByLabel("Contraseña").fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Iniciar sesión" }).click();
    await expect(page).toHaveURL(/\/admin/);

    await page.goto("/login");
    await expect(page).toHaveURL(/\/admin/);
  });
});
