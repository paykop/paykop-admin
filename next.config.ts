import type { NextConfig } from "next";

function getRemotePatterns() {
  const raw = process.env.NEXT_PUBLIC_ALLOWED_IMAGE_HOSTS || "";
  const hosts = raw
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean);

  if (hosts.length === 0) {
    return [{ protocol: "https" as const, hostname: "**" }];
  }

  return hosts.map((hostname) => ({ protocol: "https" as const, hostname }));
}

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
];

const productionCsp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: getRemotePatterns(),
  },
  async headers() {
    const headers = [...securityHeaders];
    if (process.env.NODE_ENV === "production") {
      headers.push({
        key: "Content-Security-Policy",
        value: productionCsp,
      });
    }

    return [
      {
        source: "/:path*",
        headers,
      },
    ];
  },
};

export default nextConfig;
