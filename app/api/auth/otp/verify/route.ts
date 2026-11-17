import { NextResponse } from "next/server";
import { getApiUrl, setAuthCookies } from "@/lib/auth/server";
import { otpVerifyResponseSchema } from "@/schemas/authSchema";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const apiUrl = getApiUrl();
    const endpoint = `${apiUrl}/api/v1/admin/auth/otp/verify`;

    const upstream = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      return NextResponse.json(data, { status: upstream.status });
    }

    const parsed = otpVerifyResponseSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid auth response" }, { status: 502 });
    }

    await setAuthCookies(
      parsed.data.access_token,
      parsed.data.refresh_token,
      parsed.data.expires_in
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to verify OTP" }, { status: 500 });
  }
}
