import { test, expect } from "@playwright/test";

test("sign-in page renders email step", async ({ page }) => {
  await page.goto("/sign-in");
  await expect(page.getByRole("heading", { name: /sign in|admin/i })).toBeVisible();
  await expect(page.getByPlaceholder(/email/i)).toBeVisible();
});

test("invalid email shows validation error", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByPlaceholder(/email/i).fill("not-an-email");
  await page.getByRole("button", { name: /continue|send|otp/i }).click();
  await expect(page.getByText(/valid work email/i)).toBeVisible();
});
