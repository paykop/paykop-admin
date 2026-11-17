/**
 * Cross-check web inventory against an optional Go routes file or live OPTIONS probe.
 * Usage:
 *   npx tsx scripts/sync/go-crosscheck.ts
 *   GO_ROUTES_FILE=/path/to/routes.go npx tsx scripts/sync/go-crosscheck.ts
 */

import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { ENDPOINT_INVENTORY, inventorySummary } from "./endpoint-inventory";

const defaultBackendDir = join(
  __dirname,
  "..",
  "..",
  "..",
  "paykop-backend"
);

const GO_ROUTES_FILE = process.env.GO_ROUTES_FILE;

function findRouteFiles(dir: string): string[] {
  const results: string[] = [];
  if (!existsSync(dir)) return results;

  const entries = readdirSync(dir);
  for (const entry of entries) {
    const full = join(dir, entry);
    try {
      const st = statSync(full);
      if (st.isDirectory()) {
        if (entry !== "node_modules" && entry !== ".git" && entry !== "vendor") {
          results.push(...findRouteFiles(full));
        }
      } else if (entry.endsWith("routes.go") || entry === "routes.go") {
        results.push(full);
      }
    } catch {
      // Ignore inaccessible files
    }
  }
  return results;
}

function extractGoRoutesFromFile(source: string): Set<string> {
  const routes = new Set<string>();

  // 1. Group definitions: groupVar := parentVar.Group("/path")
  const groups = new Map<string, string>();
  const groupRegex = /([a-zA-Z0-9_]+)\s*(?::=|=)\s*([a-zA-Z0-9_]+)\.Group\(\s*["`]([^"`]+)["`]/g;
  let gm: RegExpExecArray | null;
  while ((gm = groupRegex.exec(source)) !== null) {
    const [_, groupVar, parentVar, path] = gm;
    const parentPrefix = groups.get(parentVar) || "";
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    const fullPrefix = `${parentPrefix}${cleanPath}`.replace(/\/+/g, "/");
    groups.set(groupVar, fullPrefix);
  }

  // 2. Route method calls on groups or routers: group.GET("/subpath", ...)
  const routeRegex = /([a-zA-Z0-9_]+)\.(?:GET|POST|PUT|PATCH|DELETE|Head|Options)\(\s*["`]([^"`]*)["`]/g;
  let rm: RegExpExecArray | null;
  while ((rm = routeRegex.exec(source)) !== null) {
    const [_, groupVar, subPath] = rm;
    const prefix = groups.get(groupVar) || "";
    const cleanSub = subPath ? (subPath.startsWith("/") ? subPath : `/${subPath}`) : "";
    const joined = `${prefix}${cleanSub}`.replace(/\/+/g, "/");
    if (joined) routes.add(joined);
    if (subPath) routes.add(subPath);
  }

  // 3. Direct route pattern fallback
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
    .replace(/\?.*$/, "")
    .replace(/\/+$/, "") || "/";
}

function main() {
  console.log("\n=== Go API cross-check ===\n");
  const summary = inventorySummary();
  console.log("Web inventory:", summary);

  const webPaths = new Set(
    ENDPOINT_INVENTORY.filter((e) => e.path.startsWith("/api/v1") || e.path === "/health").map((e) =>
      normalizePath(e.path)
    )
  );

  let routeFiles: string[] = [];
  if (GO_ROUTES_FILE && existsSync(GO_ROUTES_FILE)) {
    const st = statSync(GO_ROUTES_FILE);
    if (st.isDirectory()) {
      routeFiles = findRouteFiles(GO_ROUTES_FILE);
    } else {
      routeFiles = [GO_ROUTES_FILE];
    }
  } else if (existsSync(defaultBackendDir)) {
    const internalDir = join(defaultBackendDir, "internal");
    const routesDir = join(defaultBackendDir, "routes");
    routeFiles = [
      ...findRouteFiles(internalDir),
      ...findRouteFiles(routesDir),
    ];
  }

  if (routeFiles.length === 0) {
    console.log("\n[INFO] Backend routes directory/files not found.");
    console.log("Web-side inventory complete. To cross-check:");
    console.log("  GO_ROUTES_FILE=/path/to/paykop-backend npx tsx scripts/sync/go-crosscheck.ts");
    process.exit(0);
  }

  console.log(`Discovered ${routeFiles.length} Go routes files in backend.`);

  const allGoRoutes = new Set<string>();
  for (const f of routeFiles) {
    try {
      const src = readFileSync(f, "utf-8");
      const routes = extractGoRoutesFromFile(src);
      routes.forEach((r) => allGoRoutes.add(r));
    } catch {
      // Ignore read error
    }
  }

  const goNormalized = new Set([...allGoRoutes].map(normalizePath));

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

  console.log("\nWeb-only (no match in Go routes files):");
  if (webOnly.length === 0) {
    console.log("  [ALL MATCHED] Every endpoint in web inventory exists in Go backend!");
  } else {
    webOnly.forEach((p) => console.log(`  ! ${p}`));
  }

  console.log("\nBackend-only admin routes (not in web inventory):");
  if (backendOnly.length === 0) {
    console.log("  [NONE] All backend admin routes covered.");
  } else {
    backendOnly.forEach((p) => console.log(`  ? ${p}`));
  }

  process.exit(webOnly.length > 0 ? 1 : 0);
}

main();

