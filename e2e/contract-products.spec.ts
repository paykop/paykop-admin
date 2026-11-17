import { test, expect } from "@playwright/test";
import { addAuthCookies, mockAuthenticatedAdmin } from "./helpers/auth";
import { productListFixture } from "./helpers/fixtures";

test("products tab renders list from proxied API contract", async ({ page, context, baseURL }) => {
  if (!baseURL) throw new Error("baseURL is required");
  await addAuthCookies(context, baseURL);
  await mockAuthenticatedAdmin(page);

  await page.route("**/api/proxy/admin/products**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(productListFixture),
    });
  });

  await page.goto("/products");
  await expect(page.getByText("Test Product")).toBeVisible();
});
