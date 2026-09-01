import { test, expect } from "@playwright/test";
import { mockUnauthenticatedSession } from "./helpers/auth";

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
