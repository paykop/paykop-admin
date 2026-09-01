import { test, expect } from "@playwright/test";

test("admin user can access banners", async ({ page, context }) => {
  await context.addCookies([
    { name: "access_token", value: "eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjk5OTk5OTk5OTl9.sig", url: "http://localhost:3000" },
    { name: "refresh_token", value: "refresh-test", url: "http://localhost:3000" },
  ]);

  await page.route("**/api/proxy/auth/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "admin-1",
        email: "admin@paykop.com",
        role: "admin",
        first_name: "Admin",
        last_name: "User",
      }),
    });
  });

  await page.route("**/api/auth/session", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ authenticated: true }),
    });
  });

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
