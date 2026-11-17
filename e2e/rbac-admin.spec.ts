import { test, expect } from "@playwright/test";
import { addAuthCookies, mockAuthenticatedAdmin } from "./helpers/auth";

test("admin user can access banners", async ({ page, context, baseURL }) => {
  if (!baseURL) throw new Error("baseURL is required");
  await addAuthCookies(context, baseURL);
  await mockAuthenticatedAdmin(page);

  await page.route("**/api/proxy/admin/banners**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ banners: [], total: 0 }),
    });
  });

  await page.goto("/banners");
  await expect(page.getByText(/homepage banners/i)).toBeVisible();
});
