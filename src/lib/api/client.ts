/**
 * Base del API. En dev y prod el frontend proxya /api/v1/** a través de
 * next.config.ts rewrites (mismo origen), de modo que la cookie HttpOnly
 * `cesar_token` fluye igual que cualquier cookie del sitio. NEXT_PUBLIC_API_URL
 * solo se usa si se desea apuntar directo al API en otro origen.
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export interface ApiErrorBody {
  detail?: string;
  title?: string;
  status?: number;
  fieldErrors?: Record<string, string[]>;
  message?: string;
}

export interface ApiResult<T> {
  ok: true;
  data: T;
  message?: string;
}

export interface ApiFailure {
  ok: false;
  message: string;
  fieldErrors?: Record<string, string[]>;
  status: number;
}

export type ApiResponse<T> = ApiResult<T> | ApiFailure;

export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors?: Record<string, string[]>;

  constructor(status: number, message: string, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

/**
 * Cliente HTTP contra cesar-fashion-api. Envía la cookie HttpOnly `cesar_token`
 * automáticamente con `credentials: "include"`.
 */
export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_URL}${path}`;
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(url, { ...init, headers, credentials: "include", cache: "no-store" });
  if (!res.ok) {
    let detail: string | undefined;
    let fieldErrors: Record<string, string[]> | undefined;
    try {
      const body = (await res.json()) as ApiErrorBody;
      detail = body.detail ?? body.message;
      fieldErrors = body.fieldErrors;
    } catch {
      detail = res.statusText;
    }
    throw new ApiError(res.status, detail ?? `Error ${res.status}`, fieldErrors);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, {
      method: "POST",
      body: body instanceof FormData ? body : body === undefined ? undefined : JSON.stringify(body),
    }),
  put: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => apiFetch<T>(path, { method: "DELETE" }),
};

/**
 * Ejecuta una llamada al API y la normaliza al formato ActionResult que usan
 * las server actions actuales ({ ok, message, fieldErrors }).
 */
export async function toActionResult<T>(
  fn: () => Promise<T>,
  successMessage: string,
): Promise<ApiResponse<T>> {
  try {
    const data = await fn();
    return { ok: true, data, message: successMessage };
  } catch (e) {
    if (e instanceof ApiError) {
      return {
        ok: false,
        message: e.message,
        fieldErrors: e.fieldErrors,
        status: e.status,
      };
    }
    return { ok: false, message: "Error inesperado", status: 500 };
  }
}