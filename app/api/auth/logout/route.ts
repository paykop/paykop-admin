import { NextResponse } from "next/server";
import {
  clearAuthCookies,
  getAccessTokenFromCookies,
  getRefreshTokenFromCookies,
  getApiUrl,
} from "@/lib/auth/server";

async function revokeOnBackend(): Promise<void> {
  const accessToken = await getAccessTokenFromCookies();
  const refreshToken = await getRefreshTokenFromCookies();
  if (!accessToken || !refreshToken) return;

  const apiUrl = getApiUrl();
  const endpoints = [
    `${apiUrl}/api/v1/admin/auth/logout`,
    `${apiUrl}/api/v1/auth/logout`,
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
        cache: "no-store",
      });
      if (response.ok) return;
    } catch {
      // Try fallback endpoint
    }
  }
}

export async function POST() {
  try {
    await revokeOnBackend();
  } finally {
    await clearAuthCookies();
  }
  return NextResponse.json({ success: true });
}
