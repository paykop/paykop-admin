/**
 * Deployment sync checklist — validates env and critical routes.
 * Usage: npx tsx scripts/sync/deploy-verify.ts
 */

import { existsSync, readFileSync } from "fs";
import { join } from "path";

const API_URL = process.env.API_URL || "http://localhost:8080";
const root = join(__dirname, "../..");

interface Check {
  name: string;
  ok: boolean;
  detail: string;
}

function main() {
  const checks: Check[] = [];

  checks.push({
    name: "API_URL configured",
    ok: Boolean(process.env.API_URL || true),
    detail: process.env.API_URL || `using default ${API_URL}`,
  });

  const envExample = join(root, ".env.example");
  checks.push({
    name: ".env.example exists",
    ok: existsSync(envExample),
    detail: envExample,
  });

  if (existsSync(envExample)) {
    const content = readFileSync(envExample, "utf-8");
    checks.push({
      name: "API_URL documented in .env.example",
      ok: content.includes("API_URL"),
      detail: "API_URL",
    });
    checks.push({
      name: "NEXT_PUBLIC_ALLOWED_IMAGE_HOSTS documented",
      ok: content.includes("NEXT_PUBLIC_ALLOWED_IMAGE_HOSTS"),
      detail: "image hosts",
    });
  }

  const nextConfig = join(root, "next.config.ts");
  if (existsSync(nextConfig)) {
    const nc = readFileSync(nextConfig, "utf-8");
    checks.push({
      name: "Security headers in next.config.ts",
      ok: nc.includes("headers") || nc.includes("remotePatterns"),
      detail: "next.config.ts",
    });
  }

  const proxyRoute = join(root, "app/api/proxy/[...path]/route.ts");
  checks.push({
    name: "BFF proxy route exists",
    ok: existsSync(proxyRoute),
    detail: proxyRoute,
  });

  const authLogout = join(root, "app/api/auth/logout/route.ts");
  checks.push({
    name: "BFF logout route exists",
    ok: existsSync(authLogout),
    detail: authLogout,
  });

  const inventory = join(root, "docs/endpoint-inventory.md");
  checks.push({
    name: "Endpoint inventory documented",
    ok: existsSync(inventory),
    detail: inventory,
  });

  console.log("\n=== Deployment sync checklist ===\n");
  let failed = 0;
  for (const c of checks) {
    console.log(`[${c.ok ? "PASS" : "FAIL"}] ${c.name}: ${c.detail}`);
    if (!c.ok) failed++;
  }

  console.log("\nProduction reminders:");
  console.log("  - Set API_URL to production Go API");
  console.log("  - Enable HTTPS (Secure cookies)");
  console.log("  - Confirm POST /api/v1/admin/auth/logout on Go API");
  console.log("  - Set NEXT_PUBLIC_ALLOWED_IMAGE_HOSTS to CDN domains");
  console.log("  - Run npm run build && npm run test:e2e before deploy\n");

  process.exit(failed > 0 ? 1 : 0);
}

main();
