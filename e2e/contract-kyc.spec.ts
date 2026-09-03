import { test, expect } from "@playwright/test";
import { addAuthCookies, mockAuthenticatedAdmin } from "./helpers/auth";
import { kycListFixture } from "./helpers/fixtures";

test("kyc tab renders submissions from proxied API contract", async ({ page, context, baseURL }) => {
  if (!baseURL) throw new Error("baseURL is required");
  await addAuthCookies(context, baseURL);
  await mockAuthenticatedAdmin(page);

  await page.route("**/api/proxy/admin/kyc/submissions**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(kycListFixture),
    });
  });

  await page.goto("/kyc");
  await expect(page.getByText(/pending/i).first()).toBeVisible();
});
