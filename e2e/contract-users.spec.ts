import { test, expect } from "@playwright/test";
import { addAuthCookies, mockAuthenticatedAdmin } from "./helpers/auth";
import { userListFixture } from "./helpers/fixtures";

test("users tab renders list from proxied API contract", async ({ page, context, baseURL }) => {
  if (!baseURL) throw new Error("baseURL is required");
  await addAuthCookies(context, baseURL);
  await mockAuthenticatedAdmin(page);

  await page.route("**/api/proxy/admin/users**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(userListFixture),
    });
  });

  await page.goto("/users");
  await expect(page.getByText("Test Buyer")).toBeVisible();
  await expect(page.getByText("buyer@example.com")).toBeVisible();
});
