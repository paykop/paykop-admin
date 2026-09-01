import { NextRequest, NextResponse } from "next/server";
import { getApiUrl, getValidAccessToken, refreshTokensFromBackend } from "@/lib/auth/server";

const FORWARDED_HEADERS = [
  "content-type",
  "idempotency-key",
  "accept",
  "accept-language",
];

function buildUpstreamUrl(pathSegments: string[], search: string): string {
  const apiUrl = getApiUrl();
  const path = pathSegments.join("/");

  if (path === "health") {
    return `${apiUrl}/health${search}`;
  }

  const base = apiUrl.endsWith("/api/v1") ? apiUrl : `${apiUrl}/api/v1`;
  return `${base}/${path}${search}`;
}

function pickForwardHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {};
  for (const name of FORWARDED_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers[name] = value;
  }
  return headers;
}

function isTokenExpiredResponse(status: number, body: unknown): boolean {
  if (status !== 401 || !body || typeof body !== "object") return false;
  const data = body as { code?: string; error?: string; message?: string };
  const code = (data.code || "").toUpperCase();
  const error = (data.error || "").toLowerCase();
  const message = (data.message || "").toLowerCase();
  return (
    code === "TOKEN_EXPIRED" ||
    error === "token_expired" ||
    message.includes("token expired") ||
    error.includes("token expired")
  );
}

async function proxyRequest(
  request: NextRequest,
  pathSegments: string[],
  accessToken: string | null,
  retryOnExpired: boolean
): Promise<NextResponse> {
  const upstreamUrl = buildUpstreamUrl(pathSegments, request.nextUrl.search);
  const headers = pickForwardHeaders(request);
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const init: RequestInit = {
    method: request.method,
    headers,
    cache: "no-store",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.text();
  }

  const upstream = await fetch(upstreamUrl, init);
  const contentType = upstream.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? await upstream.json().catch(() => null) : await upstream.text();

  if (retryOnExpired && isTokenExpiredResponse(upstream.status, body)) {
    const newToken = await refreshTokensFromBackend();
    if (newToken) {
      return proxyRequest(request, pathSegments, newToken, false);
    }
  }

  if (isJson) {
    return NextResponse.json(body ?? {}, { status: upstream.status });
  }

  return new NextResponse(typeof body === "string" ? body : "", {
    status: upstream.status,
    headers: contentType ? { "content-type": contentType } : undefined,
  });
}

async function handle(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const accessToken = await getValidAccessToken();
  return proxyRequest(request, path, accessToken, true);
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
