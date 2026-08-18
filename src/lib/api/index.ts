import { api, toActionResult } from "./client";
import type {
  AuthMe,
  Combo,
  ComboInput,
  LoginInput,
  Order,
  OrderInput,
  Product,
  ProductInput,
  UploadResponse,
  User,
  UserInput,
  WholesaleDeclarationInput,
} from "./types";

export type { ApiResponse } from "./client";
export type * from "./types";

// --- Catálogo (lecturas públicas) ---
export const catalogApi = {
  products: () => api.get<Product[]>("/api/v1/products"),
  productsOnSale: () => api.get<Product[]>("/api/v1/products/on-sale"),
  getProduct: (id: string) => api.get<Product>(`/api/v1/products/${id}`),
  combos: (includeInactive = false) =>
    api.get<Combo[]>(`/api/v1/combos${includeInactive ? "?includeInactive=true" : ""}`),
  getCombo: (id: string) => api.get<Combo>(`/api/v1/combos/${id}`),
};

// --- Autenticación ---
export interface MeResponse {
  ok: boolean;
  user: AuthMe;
}

export interface LoginResponse {
  ok: boolean;
  user: AuthMe;
}

export const authApi = {
  me: () => api.get<MeResponse>("/api/v1/auth/me"),
  logout: () => api.post<{ ok: boolean }>("/api/v1/auth/logout"),
};

export async function loginAction(email: string, password: string) {
  return toActionResult(
    () => api.post<LoginResponse>("/api/v1/auth/login", { email, password } as LoginInput),
    "Sesión iniciada",
  );
}

// --- Productos (staff) ---
export async function createProductAction(input: ProductInput) {
  return toActionResult(
    () => api.post<Product>("/api/v1/products", input),
    "Producto creado",
  );
}

export async function updateProductAction(id: string, input: ProductInput) {
  return toActionResult(
    () => api.put<Product>(`/api/v1/products/${id}`, input),
    "Producto actualizado",
  );
}

export async function toggleSaleAction(id: string) {
  return toActionResult(
    () => api.patch<Product>(`/api/v1/products/${id}/sale`, {}),
    "Oferta actualizada",
  );
}

export async function deleteProductAction(id: string) {
  return toActionResult(
    () => api.delete<void>(`/api/v1/products/${id}`),
    "Producto eliminado",
  );
}

// --- Combos (staff) ---
export async function createComboAction(input: ComboInput) {
  return toActionResult(
    () => api.post<Combo>("/api/v1/combos", input),
    "Combo creado",
  );
}

export async function updateComboAction(id: string, input: ComboInput) {
  return toActionResult(
    () => api.put<Combo>(`/api/v1/combos/${id}`, input),
    "Combo actualizado",
  );
}

export async function toggleComboActiveAction(id: string) {
  return toActionResult(
    () => api.patch<Combo>(`/api/v1/combos/${id}/active`, {}),
    "Combo actualizado",
  );
}

export async function deleteComboAction(id: string) {
  return toActionResult(
    () => api.delete<void>(`/api/v1/combos/${id}`),
    "Combo eliminado",
  );
}

// --- Pedidos ---
export const ordersApi = {
  list: () => api.get<Order[]>("/api/v1/orders"),
  get: (id: string) => api.get<Order>(`/api/v1/orders/${id}`),
};

export async function createOrderAction(input: OrderInput) {
  return toActionResult(
    () => api.post<Order>("/api/v1/orders", input),
    "Pedido creado",
  );
}

export async function updateOrderStatusAction(id: string, status: string) {
  return toActionResult(
    () => api.patch<Order>(`/api/v1/orders/${id}/status`, { status }),
    "Estado actualizado",
  );
}

// --- Usuarios (admin) ---
export const usersApi = {
  list: () => api.get<User[]>("/api/v1/users"),
};

export async function createUserAction(input: UserInput) {
  return toActionResult(
    () => api.post<User>("/api/v1/users", input),
    "Usuario creado",
  );
}

export async function updateUserAction(id: string, input: UserInput) {
  return toActionResult(
    () => api.put<User>(`/api/v1/users/${id}`, input),
    "Usuario actualizado",
  );
}

// --- Mayoreo (staff) ---
export const wholesaleApi = {
  products: () => api.get<Product[]>("/api/v1/wholesale/products"),
};

export async function declareProductAction(input: WholesaleDeclarationInput) {
  return toActionResult(
    () => api.post<Product>("/api/v1/wholesale/declarations", input),
    "Producto declarado al por mayor",
  );
}

export async function undeclareProductAction(id: string) {
  return toActionResult(
    () => api.delete<Product>(`/api/v1/wholesale/declarations/${id}`),
    "Producto retirado de la venta al por mayor",
  );
}

// --- Cargas ---
export async function uploadImage(file: File) {
  const form = new FormData();
  form.append("file", file);
  return api.post<UploadResponse>("/api/v1/uploads/images", form);
}