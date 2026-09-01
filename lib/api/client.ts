// src/lib/api/client.ts
import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";

function getClientBaseUrl(): string {
  if (typeof window === "undefined") {
    const raw = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    return raw.replace(/\/$/, "");
  }
  return "/api/proxy";
}

export function toProxyPath(endpoint: string): string {
  if (endpoint.startsWith("/api/v1/")) {
    return endpoint.slice("/api/v1/".length);
  }
  if (endpoint === "/api/v1") return "";
  if (endpoint.startsWith("/api/v1")) {
    return endpoint.slice("/api/v1".length).replace(/^\//, "");
  }
  return endpoint.replace(/^\//, "");
}

export const api = axios.create({
  baseURL: getClientBaseUrl(),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

/** @deprecated Tokens are HttpOnly cookies; use session API instead. */
export function getAccessToken(): string | null {
  return null;
}

/** @deprecated Tokens are HttpOnly cookies. */
export function getRefreshToken(): string | null {
  return null;
}

/** @deprecated Tokens are set server-side via auth routes. */
export function setTokens(_accessToken: string, _refreshToken: string, _expiresIn?: number) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("paykop-auth-change"));
  }
}

export function clearTokens() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("paykop-auth-change"));
  }
}

export function notifyAuthChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("paykop-auth-change"));
  }
}

export function handleLogout() {
  if (typeof window !== "undefined") {
    if (
      !window.location.pathname.startsWith("/sign-in") &&
      !window.location.pathname.startsWith("/login")
    ) {
      window.location.href = "/sign-in";
    }
  }
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== "undefined" && config.url) {
    config.url = toProxyPath(config.url);
  }

  delete config.headers.Authorization;

  const method = (config.method || "GET").toUpperCase();
  const isMutating = ["POST", "PUT", "PATCH", "DELETE"].includes(method);
  if (isMutating && !config.headers["Idempotency-Key"]) {
    try {
      config.headers["Idempotency-Key"] = crypto.randomUUID();
    } catch {
      config.headers["Idempotency-Key"] = "idemp-" + Math.random().toString(36).substring(2) + Date.now();
    }
  }

  return config;
});

export function postWithIdempotency<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) {
  let key: string;
  try {
    key = crypto.randomUUID();
  } catch {
    key = "idemp-" + Math.random().toString(36).substring(2) + Date.now();
  }

  return api.post<T>(url, data, {
    ...config,
    headers: {
      ...config?.headers,
      "Idempotency-Key": key,
    },
  });
}

export default api;
