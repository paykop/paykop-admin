// src/lib/api/client.ts
import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";

// Standardize base URL
const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const baseURL = rawBaseUrl.replace(/\/$/, "");

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

// Helper to retrieve token from storage or cookie
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  const localToken = localStorage.getItem("access_token");
  if (localToken) return localToken;

  // Fallback to cookie
  const match = document.cookie.match(new RegExp("(^| )access_token=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  const localRefresh = localStorage.getItem("refresh_token");
  if (localRefresh) return localRefresh;

  const match = document.cookie.match(new RegExp("(^| )refresh_token=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

export function setTokens(accessToken: string, refreshToken: string, expiresIn?: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem("access_token", accessToken);
  localStorage.setItem("refresh_token", refreshToken);

  const maxAge = expiresIn ? `max-age=${expiresIn}` : "max-age=86400";
  document.cookie = `access_token=${encodeURIComponent(accessToken)}; path=/; SameSite=Lax; ${maxAge}`;
  document.cookie = `refresh_token=${encodeURIComponent(refreshToken)}; path=/; SameSite=Lax; max-age=604800`;
  window.dispatchEvent(new Event("paykop-auth-change"));
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  document.cookie = "access_token=; path=/; max-age=0; SameSite=Lax";
  document.cookie = "refresh_token=; path=/; max-age=0; SameSite=Lax";
  window.dispatchEvent(new Event("paykop-auth-change"));
}

export function handleLogout() {
  clearTokens();
  if (typeof window !== "undefined") {
    if (!window.location.pathname.startsWith("/sign-in") && !window.location.pathname.startsWith("/login")) {
      window.location.href = "/sign-in";
    }
  }
}

// Request interceptor: attach bearer token and idempotency key
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Generate idempotency key for all mutating methods (POST, PUT, PATCH, DELETE)
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

// Response interceptor: silent token refresh on expiration
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Detect token expiry from backend standard code
    const isTokenExpired =
      error.response?.status === 401 &&
      (error.response?.data?.code === "TOKEN_EXPIRED" ||
        error.response?.data?.error === "token_expired" ||
        error.response?.data?.message?.toLowerCase().includes("token expired") ||
        error.response?.data?.error?.toLowerCase().includes("token expired"));

    if (isTokenExpired && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        handleLogout();
        return Promise.reject(error);
      }

      try {
        const refreshEndpoint = baseURL.endsWith("/api/v1")
          ? `${baseURL}/admin/auth/refresh`
          : `${baseURL}/api/v1/admin/auth/refresh`;

        const { data } = await axios.post(refreshEndpoint, {
          refresh_token: refreshToken,
        });

        const newAccessToken = data.access_token;
        const newRefreshToken = data.refresh_token || refreshToken;
        const expiresIn = data.expires_in || 86400;

        setTokens(newAccessToken, newRefreshToken, expiresIn);

        api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        handleLogout();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

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
