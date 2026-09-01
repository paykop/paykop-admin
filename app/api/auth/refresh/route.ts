import { NextResponse } from "next/server";
import { refreshTokensFromBackend } from "@/lib/auth/server";

export async function POST() {
  const accessToken = await refreshTokensFromBackend();
  if (!accessToken) {
    return NextResponse.json({ error: "Session expired" }, { status: 401 });
  }
  return NextResponse.json({ success: true });
}
