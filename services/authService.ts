// src/services/authService.ts
import {
  otpRequestResponseSchema,
  OtpVerifyResponse,
} from "../schemas/authSchema";
import { notifyAuthChange } from "../lib/api/client";

export type SessionStatus = "authenticated" | "unauthenticated" | "error";

async function authFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      (data as { message?: string }).message ||
      (data as { error?: string }).error ||
      "Authentication request failed";
    throw new Error(message);
  }
  return data as T;
}

export async function requestAdminOtp(email: string) {
  const result = await authFetch<unknown>("/api/auth/otp/request", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  return otpRequestResponseSchema.parse(result);
}

export async function verifyAdminOtp(email: string, otp: string): Promise<OtpVerifyResponse> {
  await authFetch<{ success: boolean }>("/api/auth/otp/verify", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });
  notifyAuthChange();
  return {
    access_token: "",
    refresh_token: "",
    token_type: "Bearer",
    expires_in: 86400,
  };
}

export async function logoutAdmin(): Promise<void> {
  try {
    await authFetch("/api/auth/logout", { method: "POST" });
  } catch (err) {
    console.warn("Server logout notification failed:", err);
  } finally {
    notifyAuthChange();
  }
}

export async function resolveSessionStatus(): Promise<SessionStatus> {
  try {
    const response = await fetch("/api/auth/session", {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    const data = (await response.json().catch(() => ({}))) as { authenticated?: boolean };

    if (!response.ok) {
      if (response.status === 401) return "unauthenticated";
      return "error";
    }

    return data.authenticated ? "authenticated" : "unauthenticated";
  } catch {
    return "error";
  }
}

/** True only when the server confirms an active session. */
export async function checkSession(): Promise<boolean> {
  return (await resolveSessionStatus()) === "authenticated";
}
