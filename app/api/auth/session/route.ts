import { NextResponse } from "next/server";
import { getRefreshTokenFromCookies, getValidAccessToken } from "@/lib/auth/server";

export async function GET() {
  const refreshToken = await getRefreshTokenFromCookies();
  if (!refreshToken) {
    return NextResponse.json({ authenticated: false });
  }

  const accessToken = await getValidAccessToken();
  return NextResponse.json({ authenticated: Boolean(accessToken) });
}
