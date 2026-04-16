/**
 * Custom Fetch Wrapper — Bearer token auth
 * Backend dùng JWT Bearer token (không phải httpOnly cookie).
 * Token được đọc từ Zustand store (persist localStorage).
 *
 * 401 handling:
 *   → Logout khỏi store và redirect về /login
 *   (Backend không có /auth/refresh endpoint)
 */

import type { ApiResponse } from "@/types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// ─── Api Error class ──────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public serverMessage: string | string[],
    public error: string,
  ) {
    super(
      Array.isArray(serverMessage) ? serverMessage.join(", ") : serverMessage,
    );
    this.name = "ApiError";
  }
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

type FetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  params?: Record<string, string | number | boolean | null | undefined>;
};

async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<ApiResponse<T>> {
  const { body, params, headers: extraHeaders, ...rest } = options;

  // Build URL with query params
  let url = `${API_URL}${endpoint}`;
  if (params) {
    const qs = Object.entries(params)
      .filter(([, v]) => v !== null && v !== undefined && v !== "")
      .map(
        ([k, v]) =>
          `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`,
      )
      .join("&");
    if (qs) url += `?${qs}`;
  }

  // Đọc token từ Zustand store (không cần import hook — dùng getState())
  const token = (await import("@/store/auth.store"))
    .useAuthStore.getState().token;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(extraHeaders ?? {}),
  };

  const init: RequestInit = {
    ...rest,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  };

  const response = await fetch(url, init);

  // Parse body first
  const json = await response.json().catch(() => ({}));

  // ─── 401: token hết hạn hoặc không hợp lệ → logout ───────────────────────
  if (response.status === 401) {
    const PUBLIC_ENDPOINTS = ["/auth/login", "/auth/register"];
    const isPublic = PUBLIC_ENDPOINTS.some((p) => endpoint.startsWith(p));

    if (!isPublic && typeof window !== "undefined") {
      const { useAuthStore } = await import("@/store/auth.store");
      useAuthStore.getState().logout();
      document.cookie = "hrm-token=; path=/; max-age=0";
      const alreadyOnLogin = window.location.pathname.includes("/login");
      if (!alreadyOnLogin) {
        window.location.href = "/login";
      }
    }
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      json.message ?? response.statusText,
      json.error ?? "Error",
    );
  }

  return json as ApiResponse<T>;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const fetchClient = {
  get: <T>(
    endpoint: string,
    params?: FetchOptions["params"],
    options?: Omit<FetchOptions, "params">,
  ) => apiFetch<T>(endpoint, { method: "GET", params, ...options }),

  post: <T>(endpoint: string, body?: unknown, options?: FetchOptions) =>
    apiFetch<T>(endpoint, { method: "POST", body, ...options }),

  /** Multipart form-data upload */
  postForm: <T>(endpoint: string, formData: FormData) =>
    import("@/store/auth.store").then(({ useAuthStore }) => {
      const token = useAuthStore.getState().token;
      return fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      })
        .then((res) => res.json() as Promise<ApiResponse<T>>)
        .then((json) => {
          if (json && !(json as ApiResponse<T>).success) {
            throw new ApiError(400, (json as ApiResponse<T>).message ?? "Upload failed", "Error");
          }
          return json;
        });
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: FetchOptions) =>
    apiFetch<T>(endpoint, { method: "PATCH", body, ...options }),

  put: <T>(endpoint: string, body?: unknown, options?: FetchOptions) =>
    apiFetch<T>(endpoint, { method: "PUT", body, ...options }),

  delete: <T = void>(endpoint: string, options?: FetchOptions) =>
    apiFetch<T>(endpoint, { method: "DELETE", ...options }),
};
