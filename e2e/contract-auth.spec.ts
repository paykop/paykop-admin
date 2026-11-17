import { test, expect } from "@playwright/test";
import { addAuthCookies, mockAuthenticatedAdmin, mockDashboardApis } from "./helpers/auth";

test("settings page loads profile form for authenticated admin", async ({ page, context, baseURL }) => {
  if (!baseURL) throw new Error("baseURL is required");
  await addAuthCookies(context, baseURL);
  await mockAuthenticatedAdmin(page);
  await mockDashboardApis(page);

  await page.goto("/settings");
  await expect(page.getByRole("heading", { name: "Account Settings", exact: true })).toBeVisible();
  await expect(page.getByPlaceholder("John")).toBeVisible();
});

test("devtools page is admin-only", async ({ page, context, baseURL }) => {
  if (!baseURL) throw new Error("baseURL is required");
  await addAuthCookies(context, baseURL);
  await mockAuthenticatedAdmin(page);
  await mockDashboardApis(page);

  await page.goto("/devtools");
  await expect(page.getByRole("heading", { name: "Developer Tools", exact: true })).toBeVisible();
  await expect(page.getByText(/admin action console/i)).toBeVisible();
});

test("unauthenticated proxy admin path returns 401 without upstream relay", async ({
  request,
}) => {
  const response = await request.get("/api/proxy/admin/dashboard");
  expect(response.status()).toBe(401);
  const body = await response.json();
  expect(body).toMatchObject({ error: "Unauthorized" });
});
