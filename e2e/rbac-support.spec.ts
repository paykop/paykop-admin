import { test, expect } from "@playwright/test";
import { addAuthCookies, mockAuthenticatedSupport } from "./helpers/auth";

test("support user on home redirects to tickets", async ({ page, context, baseURL }) => {
  if (!baseURL) throw new Error("baseURL is required");
  await addAuthCookies(context, baseURL);
  await mockAuthenticatedSupport(page);

  await page.goto("/");
  await expect(page).toHaveURL(/\/tickets/, { timeout: 30000 });
});

test("support user can access tickets and kyc routes", async ({ page, context, baseURL }) => {
  if (!baseURL) throw new Error("baseURL is required");
  await addAuthCookies(context, baseURL);
  await mockAuthenticatedSupport(page);

  await page.goto("/tickets");
  await expect(page).toHaveURL(/\/tickets/, { timeout: 30000 });

  await page.goto("/kyc");
  await expect(page).not.toHaveURL(/\/unauthorized/);
});

test("support user cannot access banners", async ({ page, context, baseURL }) => {
  if (!baseURL) throw new Error("baseURL is required");
  await addAuthCookies(context, baseURL);
  await mockAuthenticatedSupport(page);

  await page.goto("/banners");
  await expect(page).toHaveURL(/\/unauthorized/);
});
