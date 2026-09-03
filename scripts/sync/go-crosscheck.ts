/**
 * Cross-check web inventory against an optional Go routes file or live OPTIONS probe.
 * Usage:
 *   npx tsx scripts/sync/go-crosscheck.ts
 *   GO_ROUTES_FILE=/path/to/routes.go npx tsx scripts/sync/go-crosscheck.ts
 */

import { readFileSync, existsSync } from "fs";
import { ENDPOINT_INVENTORY, inventorySummary } from "./endpoint-inventory";

const GO_ROUTES_FILE = process.env.GO_ROUTES_FILE || "";

function extractGoRoutes(source: string): Set<string> {
  const routes = new Set<string>();
  // Common Go patterns: router.GET("/admin/users", ...) or r.Post("/api/v1/...")
  const patterns = [
    /(?:GET|POST|PUT|PATCH|DELETE|Head|Options)\s*\(\s*"([^"]+)"/g,
    /(?:GET|POST|PUT|PATCH|DELETE|Head|Options)\s*\(\s*`([^`]+)`/g,
  ];
  for (const re of patterns) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(source)) !== null) {
      routes.add(m[1]);
    }
  }
  return routes;
}

function normalizePath(p: string): string {
  return p
    .replace(/\/api\/v1/, "")
    .replace(/:\w+/g, ":id")
    .replace(/\?.*$/, "");
}

function main() {
  console.log("\n=== Go API cross-check ===\n");
  const summary = inventorySummary();
  console.log("Web inventory:", summary);

  const webPaths = new Set(
    ENDPOINT_INVENTORY.filter((e) => e.path.startsWith("/api/v1")).map((e) =>
      normalizePath(e.path)
    )
  );

  if (!GO_ROUTES_FILE || !existsSync(GO_ROUTES_FILE)) {
    console.log("\n[INFO] GO_ROUTES_FILE not set or missing.");
    console.log("Web-side inventory complete. To cross-check:");
    console.log("  GO_ROUTES_FILE=/path/to/paykop-api/routes.go npx tsx scripts/sync/go-crosscheck.ts");
    console.log("\nWeb-only endpoints to verify manually when Go repo is available:");
    for (const p of webPaths) {
      console.log(`  - /api/v1${p}`);
    }
    process.exit(0);
  }

  const source = readFileSync(GO_ROUTES_FILE, "utf-8");
  const goRoutes = extractGoRoutes(source);
  const goNormalized = new Set([...goRoutes].map(normalizePath));

  const webOnly: string[] = [];
  const backendOnly: string[] = [];

  for (const p of webPaths) {
    const found = [...goNormalized].some((g) => g === p || g.endsWith(p) || p.endsWith(g));
    if (!found) webOnly.push(p);
  }

  for (const g of goNormalized) {
    if (g.includes("admin") || g.includes("auth")) {
      const found = [...webPaths].some((w) => w === g || w.endsWith(g) || g.endsWith(w));
      if (!found) backendOnly.push(g);
    }
  }

  console.log("\nWeb-only (no match in Go routes file):");
  webOnly.forEach((p) => console.log(`  ! ${p}`));
  console.log("\nBackend-only admin routes (not in web inventory):");
  backendOnly.forEach((p) => console.log(`  ? ${p}`));

  process.exit(webOnly.length > 0 ? 1 : 0);
}

main();
