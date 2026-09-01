import { test, expect } from "@playwright/test";
import {
  addAuthCookies,
  mockAuthenticatedAdmin,
  mockDashboardApis,
} from "./helpers/auth";

async function assertStaysOffSignIn(page: import("@playwright/test").Page) {
  await expect
    .poll(() => new URL(page.url()).pathname, { timeout: 5000 })
    .not.toMatch(/\/sign-in$/);
}

test("authenticated admin stays on /kyc without sign-in redirect loop", async ({
  page,
  context,
  baseURL,
}) => {
  if (!baseURL) throw new Error("baseURL is required");
  await addAuthCookies(context, baseURL);
  await mockAuthenticatedAdmin(page);

  await page.route("**/api/proxy/admin/kyc/submissions**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ submissions: [], total: 0 }),
    });
  });

  await page.goto("/kyc");
  await expect(page).toHaveURL(/\/kyc/);
  await expect(page.getByText(/live security handshake/i)).toBeVisible({ timeout: 15000 });
  await expect(page.getByText(/seller kyc/i)).toBeVisible({ timeout: 15000 });

  await assertStaysOffSignIn(page);
  await expect(page).toHaveURL(/\/kyc/);
});

test("authenticated admin can navigate between dashboard routes", async ({
  page,
  context,
  baseURL,
}) => {
  test.setTimeout(60000);
  if (!baseURL) throw new Error("baseURL is required");
  await addAuthCookies(context, baseURL);
  await mockAuthenticatedAdmin(page);
  await mockDashboardApis(page);

  await page.route("**/api/proxy/admin/kyc/submissions**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ submissions: [], total: 0 }),
    });
  });

  await page.goto("/");
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText(/live security handshake/i)).toBeVisible({ timeout: 15000 });

  await page.goto("/kyc");
  await expect(page).toHaveURL(/\/kyc/);
  await expect(page.getByText(/seller kyc/i)).toBeVisible({ timeout: 15000 });

  await assertStaysOffSignIn(page);
});
