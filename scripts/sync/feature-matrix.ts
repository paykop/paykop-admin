/**
 * Feature matrix: smoke-test GET endpoints from inventory against Go API.
 * Usage: ADMIN_ACCESS_TOKEN=... API_URL=... npx tsx scripts/sync/feature-matrix.ts
 */

import { ENDPOINT_INVENTORY } from "./endpoint-inventory";

const API_URL = process.env.API_URL || "http://localhost:8080";
const ADMIN_TOKEN = process.env.ADMIN_ACCESS_TOKEN || "";

function toSmokePath(path: string): string | null {
  if (!path.startsWith("/api/v1")) return null;
  if (path.includes(":")) {
    // Replace path params with placeholder — skip mutation-only routes
    return null;
  }
  return path.replace("/api/v1", "");
}

async function smokeGet(apiPath: string): Promise<{ ok: boolean; status: number }> {
  const url = `${API_URL}/api/v1${apiPath}`;
  const res = await fetch(url, {
    headers: ADMIN_TOKEN ? { Authorization: `Bearer ${ADMIN_TOKEN}` } : {},
    cache: "no-store",
  });
  return { ok: res.ok || res.status === 401 || res.status === 403, status: res.status };
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  if (!ADMIN_TOKEN && !dryRun) {
    console.error("ADMIN_ACCESS_TOKEN is required (or pass --dry-run to list endpoints only)");
    process.exit(1);
  }

  console.log(`\n=== Feature matrix smoke (API_URL=${API_URL}) ===\n`);

  const getEndpoints = ENDPOINT_INVENTORY.filter(
    (e) => e.method === "GET" && e.path.startsWith("/api/v1") && !e.path.includes(":")
  );

  if (dryRun) {
    console.log(`[DRY-RUN] ${getEndpoints.length} GET endpoints in test matrix:\n`);
    for (const ep of getEndpoints) {
      console.log(`  - ${ep.domain}: ${ep.path} (${ep.ui})`);
    }
    process.exit(0);
  }

  let failed = 0;
  for (const ep of getEndpoints) {
    const smokePath = toSmokePath(ep.path.split("?")[0]);
    if (!smokePath) continue;

    const query = ep.path.includes("?") ? ep.path.slice(ep.path.indexOf("?")) : "";
    const { ok, status } = await smokeGet(`${smokePath}${query}`);
    const icon = ok ? "PASS" : "FAIL";
    console.log(`[${icon}] ${ep.domain} GET ${ep.path} → ${status}`);
    if (!ok) failed++;
  }

  console.log(`\n${getEndpoints.length - failed}/${getEndpoints.length} GET endpoints reachable\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
