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
