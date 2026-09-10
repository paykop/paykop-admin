import { NextResponse } from "next/server";
import {
  clearAuthCookies,
  getAccessTokenFromCookies,
  getRefreshTokenFromCookies,
  getApiV1Url,
} from "@/lib/auth/server";

async function revokeOnBackend(): Promise<boolean> {
  const accessToken = await getAccessTokenFromCookies();
  const refreshToken = await getRefreshTokenFromCookies();
  if (!accessToken && !refreshToken) return false;

  const apiV1Url = getApiV1Url();
  const endpoints = [
    `${apiV1Url}/admin/auth/logout`,
    `${apiV1Url}/auth/logout`,
  ];

  for (const endpoint of endpoints) {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(refreshToken ? { refresh_token: refreshToken } : {}),
        cache: "no-store",
      });
      if (response.ok) return true;
    } catch {
      // Try fallback endpoint
    }
  }

  return false;
}

export async function POST() {
  let revoked = false;
  try {
    revoked = await revokeOnBackend();
  } finally {
    await clearAuthCookies();
  }
  return NextResponse.json({ success: true, revoked });
}
