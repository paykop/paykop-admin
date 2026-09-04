import { NextRequest, NextResponse } from "next/server";
import { getApiUrl } from "@/lib/auth/server";
import { otpRequestSchema } from "@/schemas/authSchema";
import {
  checkRateLimit,
  OTP_EMAIL_LIMIT,
  OTP_IP_LIMIT,
} from "@/lib/auth/rateLimit";

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json().catch(() => null);
    const parsed = otpRequestSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const email = parsed.data.email.trim().toLowerCase();
    const ip = clientIp(request);

    const emailLimit = checkRateLimit(`otp:email:${email}`, OTP_EMAIL_LIMIT);
    const ipLimit = checkRateLimit(`otp:ip:${ip}`, OTP_IP_LIMIT);
    if (!emailLimit.allowed || !ipLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const apiUrl = getApiUrl();
    const endpoint = `${apiUrl}/api/v1/admin/auth/otp/request`;

    const upstream = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
      cache: "no-store",
    });

    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, { status: upstream.status });
  } catch {
    return NextResponse.json({ error: "Failed to request OTP" }, { status: 500 });
  }
}
