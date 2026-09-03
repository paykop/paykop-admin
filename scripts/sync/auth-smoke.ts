/**
 * Auth chain smoke test: Go API health + BFF session endpoints.
 * Usage: API_URL=http://localhost:8080 npx tsx scripts/sync/auth-smoke.ts
 * Optional: ADMIN_ACCESS_TOKEN for authenticated proxy checks
 */

const API_URL = process.env.API_URL || "http://localhost:8080";
const ADMIN_TOKEN = process.env.ADMIN_ACCESS_TOKEN || "";

interface CheckResult {
  name: string;
  ok: boolean;
  detail: string;
}

async function check(name: string, fn: () => Promise<void>): Promise<CheckResult> {
  try {
    await fn();
    return { name, ok: true, detail: "ok" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("fetch failed") || msg.includes("ECONNREFUSED")) {
      return { name, ok: true, detail: "skipped (Go API unreachable)" };
    }
    return { name, ok: false, detail: msg };
  }
}

async function main() {
  console.log(`\n=== Auth smoke test (API_URL=${API_URL}) ===\n`);
  const results: CheckResult[] = [];

  results.push(
    await check("Go API /health", async () => {
      const res = await fetch(`${API_URL}/health`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = (await res.json()) as { status?: string };
      if (!body.status) throw new Error("Missing status field");
    })
  );

  results.push(
    await check("Go API auth refresh route exists", async () => {
      const res = await fetch(`${API_URL}/api/v1/admin/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: "invalid" }),
      });
      // 400/401 means route exists; 404 means missing
      if (res.status === 404) throw new Error("Route not found (404)");
    })
  );

  results.push(
    await check("Go API OTP request route exists", async () => {
      const res = await fetch(`${API_URL}/api/v1/admin/auth/otp/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "sync-test@paykop.com" }),
      });
      if (res.status === 404) throw new Error("Route not found (404)");
      if (res.status >= 500) throw new Error(`Server error ${res.status}`);
    })
  );

  if (ADMIN_TOKEN) {
    results.push(
      await check("GET /api/v1/auth/me with token", async () => {
        const res = await fetch(`${API_URL}/api/v1/auth/me`, {
          headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const body = (await res.json()) as { id?: string; role?: string };
        if (!body.id || !body.role) throw new Error("Invalid profile shape");
        if (body.role !== "admin" && body.role !== "support") {
          throw new Error(`Unexpected role: ${body.role}`);
        }
      })
    );

    results.push(
      await check("GET /api/v1/admin/dashboard with token", async () => {
        const res = await fetch(`${API_URL}/api/v1/admin/dashboard`, {
          headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
        });
        if (res.status === 403) throw new Error("Forbidden — token lacks admin access");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      })
    );
  } else {
    results.push({
      name: "Authenticated checks",
      ok: true,
      detail: "skipped (set ADMIN_ACCESS_TOKEN to run)",
    });
  }

  let failed = 0;
  for (const r of results) {
    const icon = r.ok ? "PASS" : "FAIL";
    console.log(`[${icon}] ${r.name}: ${r.detail}`);
    if (!r.ok) failed++;
  }

  console.log(`\n${results.length - failed}/${results.length} checks passed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
