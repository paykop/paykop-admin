import { test, expect } from "@playwright/test";
import {
  addAuthCookies,
  mockAuthenticatedAdmin,
  mockDashboardApis,
  mockUnauthenticatedSession,
} from "./helpers/auth";

function emailInput(page: import("@playwright/test").Page) {
  return page.getByRole("textbox", { name: /admin@paykop/i });
}

test("sign-in page renders email step", async ({ page }) => {
  await mockUnauthenticatedSession(page);
  await page.goto("/sign-in");
  await expect(page.getByRole("heading", { name: /paykop admin portal/i })).toBeVisible();
  await expect(emailInput(page)).toBeVisible();
});

test("invalid email shows validation error", async ({ page }) => {
  await mockUnauthenticatedSession(page);
  await page.route("**/api/auth/otp/request", async (route) => {
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ message: "OTP request should not run for invalid email" }),
    });
  });
  await page.goto("/sign-in");
  await emailInput(page).fill("not-an-email");
  await page.getByRole("button", { name: "Continue with OTP", exact: true }).click();
  await expect(page.getByText(/please enter a valid work email address/i)).toBeVisible();
});

test("successful OTP login stays on dashboard instead of bouncing to sign-in", async ({
  page,
  context,
  baseURL,
}) => {
  test.setTimeout(60000);
  if (!baseURL) throw new Error("baseURL is required");

  let authenticated = false;
  await mockAuthenticatedAdmin(page);
  await mockDashboardApis(page);
  await page.route("**/api/auth/session", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ authenticated }),
    });
  });
  await page.route("**/api/auth/otp/request", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ message: "OTP sent" }),
    });
  });
  await page.route("**/api/auth/otp/verify", async (route) => {
    await addAuthCookies(context, baseURL);
    authenticated = true;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true }),
    });
  });

  await page.goto("/sign-in");
  await expect(page.getByRole("heading", { name: /paykop admin portal/i })).toBeVisible();
  await emailInput(page).fill("admin@paykop.com");
  await page.getByRole("button", { name: "Continue with OTP", exact: true }).click();
  await expect(page.getByRole("heading", { name: /enter security code/i })).toBeVisible();

  const otpInputs = page.locator('input[inputmode="numeric"]');
  for (let i = 0; i < 6; i += 1) {
    await otpInputs.nth(i).fill(String(i + 1));
  }
  await page.getByRole("button", { name: /verify & sign in/i }).click();

  await expect.poll(() => new URL(page.url()).pathname, { timeout: 15000 }).not.toMatch(/\/sign-in$/);
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText(/live security handshake/i)).toBeVisible({ timeout: 15000 });
  await expect.poll(() => new URL(page.url()).pathname, { timeout: 5000 }).not.toMatch(/\/sign-in$/);
});

