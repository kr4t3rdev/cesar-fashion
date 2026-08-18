/**
 * Acciones cliente (sin "use server") que replican las firmas de las server
 * actions de src/server/application/* pero llaman al API Spring de forma remota.
 * Cada función parsea FormData → JSON (coerción equivalente a los schemas zod)
 * y devuelve un ClientActionResult compatible con ({ ok, message, fieldErrors })
 * que consumen los forms (useActionState) y las tablas.
 */
import { api, ApiError } from "./client";

export interface ClientActionResult<T = unknown> {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
  status?: number;
  data?: T;
  reference?: string;
  code?: "UNAUTHENTICATED" | "INACTIVE";
}

async function run<T>(
  fn: () => Promise<T>,
  successMessage: string,
): Promise<ClientActionResult<T>> {
  try {
    const data = await fn();
    return { ok: true, message: successMessage, data };
  } catch (e) {
    if (e instanceof ApiError) {
      return { ok: false, message: e.message, fieldErrors: e.fieldErrors, status: e.status };
    }
    return { ok: false, message: "Error inesperado" };
  }
}

function str(fd: FormData, key: string): string {
  return String(fd.get(key) ?? "");
}

function optStr(fd: FormData, key: string): string | null {
  const v = fd.get(key);
  if (v == null) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

function num(fd: FormData, key: string): number {
  return Number(fd.get(key) ?? 0);
}

function bool(fd: FormData, key: string): boolean {
  return fd.get(key) === "on";
}

interface ProductInput {
  name: string;
  description: string;
  category: string;
  price: number;
  salePrice: number | null;
  currency: string;
  stock: number;
  imageUrl: string | null;
  isOnSale: boolean;
  saleLabel: string | null;
  featured: boolean;
  isWholesale: boolean;
  wholesaleUnitName: string | null;
  wholesaleUnitQuantity: number;
}

function productInput(fd: FormData): ProductInput {
  return {
    name: str(fd, "name").trim(),
    description: str(fd, "description").trim(),
    category: str(fd, "category").trim(),
    price: num(fd, "price"),
    salePrice: optStr(fd, "salePrice") === null ? null : num(fd, "salePrice"),
    currency: optStr(fd, "currency") ?? "USD",
    stock: num(fd, "stock"),
    imageUrl: optStr(fd, "imageUrl"),
    isOnSale: bool(fd, "isOnSale"),
    saleLabel: optStr(fd, "saleLabel"),
    featured: bool(fd, "featured"),
    isWholesale: bool(fd, "isWholesale"),
    wholesaleUnitName: optStr(fd, "wholesaleUnitName"),
    wholesaleUnitQuantity: num(fd, "wholesaleUnitQuantity") || 1,
  };
}

interface ComboInput {
  name: string;
  description: string;
  price: number;
  salePrice: number | null;
  currency: string;
  imageUrl: string | null;
  isOnSale: boolean;
  saleLabel: string | null;
  featured: boolean;
  items: { productId: string; quantity: number }[];
}

function comboInput(fd: FormData): ComboInput {
  const productIds = fd.getAll("productId") as string[];
  const quantities = fd.getAll("quantity") as string[];
  return {
    name: str(fd, "name").trim(),
    description: str(fd, "description").trim(),
    price: num(fd, "price"),
    salePrice: optStr(fd, "salePrice") === null ? null : num(fd, "salePrice"),
    currency: optStr(fd, "currency") ?? "USD",
    imageUrl: optStr(fd, "imageUrl"),
    isOnSale: bool(fd, "isOnSale"),
    saleLabel: optStr(fd, "saleLabel"),
    featured: bool(fd, "featured"),
    items: productIds.map((productId, index) => ({
      productId,
      quantity: Number(quantities[index] ?? 1) || 1,
    })),
  };
}

// --- Productos ---

export async function createProductAction(
  _prevState: unknown,
  fd: FormData,
): Promise<ClientActionResult> {
  return run(() => api.post("/api/v1/products", productInput(fd)), "Producto creado correctamente");
}

export async function updateProductAction(
  _prevState: unknown,
  fd: FormData,
): Promise<ClientActionResult> {
  const id = str(fd, "id");
  if (!id) return { ok: false, message: "Falta el id del producto" };
  return run(() => api.put(`/api/v1/products/${id}`, productInput(fd)), "Producto actualizado correctamente");
}

export async function toggleSaleAction(fd: FormData): Promise<ClientActionResult> {
  const id = str(fd, "id");
  if (!id) return { ok: false, message: "Falta el id del producto" };
  return run(() => api.patch(`/api/v1/products/${id}/sale`, {}), "Oferta actualizada");
}

export async function deleteProductAction(fd: FormData): Promise<ClientActionResult> {
  const id = str(fd, "id");
  if (!id) return { ok: false, message: "Falta el id del producto" };
  return run(() => api.delete(`/api/v1/products/${id}`), "Producto eliminado correctamente");
}

// --- Combos ---

export async function createComboAction(
  _prevState: unknown,
  fd: FormData,
): Promise<ClientActionResult> {
  return run(() => api.post("/api/v1/combos", comboInput(fd)), "Combo creado correctamente");
}

export async function updateComboAction(
  _prevState: unknown,
  fd: FormData,
): Promise<ClientActionResult> {
  const id = str(fd, "id");
  if (!id) return { ok: false, message: "Falta el id del combo" };
  return run(() => api.put(`/api/v1/combos/${id}`, comboInput(fd)), "Combo actualizado correctamente");
}

export async function toggleComboAction(fd: FormData): Promise<ClientActionResult> {
  const id = str(fd, "id");
  if (!id) return { ok: false, message: "Falta el id del combo" };
  return run(() => api.patch(`/api/v1/combos/${id}/active`, {}), "Combo actualizado");
}

export async function deleteComboAction(fd: FormData): Promise<ClientActionResult> {
  const id = str(fd, "id");
  if (!id) return { ok: false, message: "Falta el id del combo" };
  return run(() => api.delete(`/api/v1/combos/${id}`), "Combo eliminado correctamente");
}

// --- Usuarios ---

export async function createUserAction(
  _prevState: unknown,
  fd: FormData,
): Promise<ClientActionResult> {
  return run(
    () => api.post("/api/v1/users", {
      name: str(fd, "name").trim(),
      email: str(fd, "email").trim(),
      password: str(fd, "password"),
      role: str(fd, "role"),
    }),
    "Usuario creado correctamente",
  );
}

export async function updateUserAction(
  _prevState: unknown,
  fd: FormData,
): Promise<ClientActionResult> {
  const id = str(fd, "id");
  if (!id) return { ok: false, message: "Falta el id del usuario" };
  return run(
    () => api.put(`/api/v1/users/${id}`, {
      name: str(fd, "name").trim(),
      email: str(fd, "email").trim(),
      role: str(fd, "role"),
    }),
    "Usuario actualizado correctamente",
  );
}

export async function changePasswordAction(
  _prevState: unknown,
  fd: FormData,
): Promise<ClientActionResult> {
  const id = str(fd, "id");
  const password = str(fd, "password");
  if (!id) return { ok: false, message: "Falta el id del usuario" };
  if (password.trim().length < 6) {
    return {
      ok: false,
      message: "Datos inválidos",
      fieldErrors: { password: ["La contraseña debe tener al menos 6 caracteres"] },
    };
  }
  return run(() => api.patch(`/api/v1/users/${id}/password`, { password }), "Contraseña actualizada correctamente");
}

export async function deleteUserAction(fd: FormData): Promise<ClientActionResult> {
  const id = str(fd, "id");
  if (!id) return { ok: false, message: "Falta el id del usuario" };
  return run(() => api.delete(`/api/v1/users/${id}`), "Usuario eliminado correctamente");
}

export async function setUserStatusAction(fd: FormData): Promise<ClientActionResult> {
  const id = str(fd, "id");
  const status = str(fd, "status");
  if (!id || (status !== "active" && status !== "disabled" && status !== "pending")) {
    return { ok: false, message: "Datos inválidos" };
  }
  return run(() => api.patch(`/api/v1/users/${id}/status`, { status }), "Estado actualizado correctamente");
}

// --- Mayoreo ---

export async function declareWholesaleProductAction(
  _prevState: unknown,
  fd: FormData,
): Promise<ClientActionResult> {
  return run(
    () =>
      api.post("/api/v1/wholesale/declarations", {
        productId: str(fd, "productId"),
        wholesaleUnitName: str(fd, "wholesaleUnitName").trim(),
        wholesaleUnitQuantity: num(fd, "wholesaleUnitQuantity") || 1,
      }),
    "Producto declarado al por mayor",
  );
}

export async function undeclareWholesaleProductAction(fd: FormData): Promise<ClientActionResult> {
  const id = str(fd, "id");
  if (!id) return { ok: false, message: "Falta el id del producto" };
  return run(() => api.delete(`/api/v1/wholesale/declarations/${id}`), "Producto retirado de la venta al por mayor");
}

// --- Pedidos ---

interface CartLine {
  kind: "product" | "combo";
  id: string;
  quantity: number;
}

interface OrderCustomer {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  note: string;
}

export async function createOrderAction(
  cart: CartLine[],
  customer: OrderCustomer,
): Promise<ClientActionResult> {
  try {
    const data = await api.post<{ ok: boolean; reference: string; orderId: string }>("/api/v1/orders", {
      customerName: customer.customerName,
      customerPhone: customer.customerPhone,
      customerEmail: customer.customerEmail,
      note: customer.note,
      items: cart,
    });
    return { ok: true, message: "Pedido registrado correctamente", reference: data.reference };
  } catch (e) {
    if (e instanceof ApiError) {
      if (e.status === 401) {
        return { ok: false, message: "Inicia sesión para finalizar tu pedido", code: "UNAUTHENTICATED", status: 401 };
      }
      if (e.status === 403) {
        return { ok: false, message: e.message || "Tu cuenta está pendiente de activación", code: "INACTIVE", status: 403 };
      }
      return { ok: false, message: e.message, fieldErrors: e.fieldErrors, status: e.status };
    }
    return { ok: false, message: "Error inesperado" };
  }
}

export async function markOrderPaidAction(fd: FormData): Promise<ClientActionResult> {
  const id = str(fd, "id");
  if (!id) return { ok: false, message: "Falta el id del pedido" };
  return run(() => api.patch(`/api/v1/orders/${id}/status`, { status: "paid" }), "Pedido marcado como pagado");
}

export async function cancelOrderAction(fd: FormData): Promise<ClientActionResult> {
  const id = str(fd, "id");
  if (!id) return { ok: false, message: "Falta el id del pedido" };
  return run(() => api.patch(`/api/v1/orders/${id}/status`, { status: "cancelled" }), "Pedido cancelado");
}

// --- Registro ---

export async function registerAction(
  _prevState: unknown,
  fd: FormData,
): Promise<ClientActionResult> {
  try {
    const data = await api.post<{ ok: boolean; message: string }>("/api/v1/auth/register", {
      name: str(fd, "name").trim(),
      email: str(fd, "email").trim(),
      password: str(fd, "password"),
    });
    return { ok: true, message: data.message ?? "Cuenta creada. Espera a que el administrador la active." };
  } catch (e) {
    if (e instanceof ApiError) {
      return { ok: false, message: e.message, fieldErrors: e.fieldErrors, status: e.status };
    }
    return { ok: false, message: "Error inesperado" };
  }
}
