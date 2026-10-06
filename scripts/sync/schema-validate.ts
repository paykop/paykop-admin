/**
 * Validate Zod schemas against fixture JSON and optionally live API responses.
 * Usage: npx tsx scripts/sync/schema-validate.ts
 * Live: ADMIN_ACCESS_TOKEN=... API_URL=... npx tsx scripts/sync/schema-validate.ts --live
 */

import { readFileSync } from "fs";
import { join } from "path";
import { z } from "zod";
import { backendUserSchema, userListResponseSchema, permissionsResponseSchema } from "../../schemas/userSchema";
import { dashboardResponseSchema, adminMetricsSchema } from "../../schemas/dashboardSchema";
import { ticketListRawResponseSchema } from "../../schemas/ticketSchema";
import { kycSubmissionListResponseSchema } from "../../schemas/kycSchema";
import { adminProductListResponseSchema } from "../../schemas/productSchema";
import { bannerListResponseSchema } from "../../schemas/bannerSchema";
import { notificationListResponseSchema } from "../../schemas/notificationSchema";
import { auditLogListResponseSchema } from "../../schemas/logSchema";
import { subscriptionPlanSchema } from "../../schemas/subscriptionSchema";
import { commerceSettingsSchema } from "../../schemas/commerceSchema";
import { payoutListResponseSchema } from "../../schemas/payoutSchema";
import { organizationSchema } from "../../schemas/organizationSchema";
import { donationLedgerResponseSchema } from "../../schemas/donationSchema";

const FIXTURES_DIR = join(__dirname, "fixtures");
const LIVE = process.argv.includes("--live");
const API_URL = process.env.API_URL || "http://localhost:8080";
const ADMIN_TOKEN = process.env.ADMIN_ACCESS_TOKEN || "";

type ValidationCase = {
  name: string;
  schema: z.ZodTypeAny;
  fixture: string;
  livePath?: string;
};

const CASES: ValidationCase[] = [
  { name: "backendUser", schema: backendUserSchema, fixture: "user-profile.json" },
  { name: "userList", schema: userListResponseSchema, fixture: "user-list.json", livePath: "/api/v1/admin/users?page=1&limit=5" },
  { name: "permissions", schema: permissionsResponseSchema, fixture: "permissions.json" },
  { name: "dashboard", schema: dashboardResponseSchema, fixture: "dashboard.json", livePath: "/api/v1/admin/dashboard" },
  { name: "metrics", schema: adminMetricsSchema, fixture: "metrics.json", livePath: "/api/v1/admin/metrics" },
  { name: "tickets", schema: ticketListRawResponseSchema, fixture: "tickets.json", livePath: "/api/v1/admin/tickets?page=1&limit=5" },
  { name: "kyc", schema: kycSubmissionListResponseSchema, fixture: "kyc-list.json", livePath: "/api/v1/admin/kyc/submissions?page=1&limit=5" },
  { name: "products", schema: adminProductListResponseSchema, fixture: "products.json", livePath: "/api/v1/admin/products?page=1&limit=5" },
  { name: "banners", schema: bannerListResponseSchema, fixture: "banners.json", livePath: "/api/v1/banners?only_active=false" },
  { name: "notifications", schema: notificationListResponseSchema, fixture: "notifications.json", livePath: "/api/v1/notifications?page=1&limit=5" },
  { name: "logs", schema: auditLogListResponseSchema, fixture: "logs.json", livePath: "/api/v1/admin/logs?page=1&limit=5" },
  { name: "subscriptionPlan", schema: subscriptionPlanSchema, fixture: "subscription-plan.json" },
  { name: "commerceSettings", schema: commerceSettingsSchema, fixture: "commerce-settings.json", livePath: "/api/v1/admin/commerce/settings" },
  { name: "payouts", schema: payoutListResponseSchema, fixture: "payouts.json", livePath: "/api/v1/admin/payouts" },
  { name: "organization", schema: organizationSchema, fixture: "organization.json" },
  { name: "donations", schema: donationLedgerResponseSchema, fixture: "donations.json", livePath: "/api/v1/admin/donations" },
];


function loadFixture(name: string): unknown {
  const raw = readFileSync(join(FIXTURES_DIR, name), "utf-8");
  return JSON.parse(raw);
}

async function fetchLive(path: string): Promise<unknown> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${path}`);
  return res.json();
}

async function main() {
  console.log(`\n=== Schema validation (${LIVE ? "fixtures + live" : "fixtures only"}) ===\n`);
  let failed = 0;

  for (const c of CASES) {
    try {
      const data = loadFixture(c.fixture);
      c.schema.parse(data);
      console.log(`[PASS] fixture: ${c.name}`);
    } catch (err) {
      failed++;
      console.log(`[FAIL] fixture: ${c.name} — ${err instanceof Error ? err.message : err}`);
    }

    if (LIVE && c.livePath && ADMIN_TOKEN) {
      try {
        const live = await fetchLive(c.livePath);
        c.schema.parse(live);
        console.log(`[PASS] live: ${c.name}`);
      } catch (err) {
        failed++;
        console.log(`[FAIL] live: ${c.name} — ${err instanceof Error ? err.message : err}`);
      }
    }
  }

  if (LIVE && !ADMIN_TOKEN) {
    console.log("\n[WARN] Live checks skipped — set ADMIN_ACCESS_TOKEN");
  }

  console.log(`\n${failed === 0 ? "All schema checks passed" : `${failed} check(s) failed`}\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
