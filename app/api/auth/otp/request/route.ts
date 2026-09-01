import { NextResponse } from "next/server";
import { getApiUrl } from "@/lib/auth/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const apiUrl = getApiUrl();
    const endpoint = `${apiUrl}/api/v1/admin/auth/otp/request`;

    const upstream = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, { status: upstream.status });
  } catch {
    return NextResponse.json({ error: "Failed to request OTP" }, { status: 500 });
  }
}
