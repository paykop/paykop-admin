import { cookies } from "next/headers";

export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";

const DEFAULT_ACCESS_MAX_AGE = 86400;
const DEFAULT_REFRESH_MAX_AGE = 604800;

export function getApiUrl(): string {
  const raw = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  return raw.replace(/\/$/, "");
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

export async function refreshTokensFromBackend(): Promise<string | null> {
  const refreshToken = await getRefreshTokenFromCookies();
  if (!refreshToken) return null;

  const apiUrl = getApiUrl();
  const refreshEndpoint = apiUrl.endsWith("/api/v1")
    ? `${apiUrl}/admin/auth/refresh`
    : `${apiUrl}/api/v1/admin/auth/refresh`;

  const response = await fetch(refreshEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
    cache: "no-store",
  });

  if (!response.ok) return null;

  const data = (await response.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
  };

  if (!data.access_token) return null;

  await setAuthCookies(
    data.access_token,
    data.refresh_token || refreshToken,
    data.expires_in
  );

  return data.access_token;
}

export async function getValidAccessToken(): Promise<string | null> {
  const accessToken = await getAccessTokenFromCookies();
  if (accessToken && !isTokenExpired(accessToken)) {
    return accessToken;
  }
  return refreshTokensFromBackend();
}
