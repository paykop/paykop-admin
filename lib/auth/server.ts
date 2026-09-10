import { cookies } from "next/headers";
import crypto from "crypto";

export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";

const DEFAULT_ACCESS_MAX_AGE = 86400;
const DEFAULT_REFRESH_MAX_AGE = 86400; // 24 hours (Track S staff session limit)

const inFlightRefreshes = new Map<string, Promise<string | null>>();

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function getInFlightRefreshesCount(): number {
  return inFlightRefreshes.size;
}

export interface TokenRefreshOptions {
  apiUrl?: string;
  onSuccess?: (accessToken: string, refreshToken: string, expiresIn?: number) => Promise<void>;
  onFailure?: () => Promise<void>;
  fetchFn?: typeof fetch;
}

export async function performTokenRefresh(
  refreshToken: string,
  options?: TokenRefreshOptions
): Promise<string | null> {
  const tokenKey = hashToken(refreshToken);
  const existing = inFlightRefreshes.get(tokenKey);
  if (existing) {
    return existing;
  }

  const apiUrl = options?.apiUrl ?? getApiV1Url();
  const fetchFn = options?.fetchFn ?? fetch;
  const onSuccess = options?.onSuccess ?? setAuthCookies;
  const onFailure = options?.onFailure ?? clearAuthCookies;

  const refreshPromise = (async () => {
    try {
      const response = await fetchFn(`${apiUrl}/admin/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
        cache: "no-store",
      });

      if (!response.ok) {
        await onFailure();
        return null;
      }

      const data = (await response.json()) as {
        access_token?: string;
        refresh_token?: string;
        expires_in?: number;
      };

      // Strict contract enforcement: both access_token AND refresh_token must be present.
      // Never fall back to the stale old token under single-use rotation.
      if (!data.access_token || !data.refresh_token) {
        await onFailure();
        return null;
      }

      await onSuccess(
        data.access_token,
        data.refresh_token,
        data.expires_in
      );

      return data.access_token;
    } catch {
      return null;
    } finally {
      inFlightRefreshes.delete(tokenKey);
    }
  })();

  inFlightRefreshes.set(tokenKey, refreshPromise);
  return refreshPromise;
}

export async function refreshTokensFromBackend(): Promise<string | null> {
  const refreshToken = await getRefreshTokenFromCookies();
  if (!refreshToken) return null;
  return performTokenRefresh(refreshToken);
}

export function getApiUrl(): string {
  const raw = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  return raw.replace(/\/$/, "");
}

export function getApiV1Url(): string {
  const raw = getApiUrl();
  return raw.endsWith("/api/v1") ? raw : `${raw}/api/v1`;
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export async function setAuthCookies(
  accessToken: string,
  refreshToken: string,
  expiresIn?: number
): Promise<void> {
  const cookieStore = await cookies();
  const accessMaxAge = expiresIn ?? DEFAULT_ACCESS_MAX_AGE;

  cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, cookieOptions(accessMaxAge));
  cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, cookieOptions(DEFAULT_REFRESH_MAX_AGE));
}

export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_TOKEN_COOKIE, "", { ...cookieOptions(0), maxAge: 0 });
  cookieStore.set(REFRESH_TOKEN_COOKIE, "", { ...cookieOptions(0), maxAge: 0 });
}

export async function getAccessTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

export async function getRefreshTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value ?? null;
}

export function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return true;
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as {
      exp?: number;
    };
    if (!payload.exp) return false;
    return payload.exp * 1000 <= Date.now();
  } catch {
    return false;
  }
}

export async function getValidAccessToken(): Promise<string | null> {
  const accessToken = await getAccessTokenFromCookies();
  if (accessToken && !isTokenExpired(accessToken)) {
    return accessToken;
  }
  return refreshTokensFromBackend();
}
