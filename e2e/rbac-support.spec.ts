import { test, expect } from "@playwright/test";

test("support user on home redirects to tickets", async ({ page, context }) => {
  await context.addCookies([
    { name: "access_token", value: "eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjk5OTk5OTk5OTl9.sig", url: "http://localhost:3000" },
    { name: "refresh_token", value: "refresh-test", url: "http://localhost:3000" },
  ]);

  await page.route("**/api/proxy/auth/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "support-1",
        email: "support@paykop.com",
        role: "support",
        first_name: "Support",
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

  await page.goto("/");
  await expect(page).toHaveURL(/\/tickets/);
});

test("support user cannot access banners", async ({ page, context }) => {
  await context.addCookies([
    { name: "access_token", value: "eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjk5OTk5OTk5OTl9.sig", url: "http://localhost:3000" },
    { name: "refresh_token", value: "refresh-test", url: "http://localhost:3000" },
  ]);

  await page.route("**/api/proxy/auth/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "support-1",
        email: "support@paykop.com",
        role: "support",
        first_name: "Support",
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

  await page.goto("/banners");
  await expect(page).toHaveURL(/\/unauthorized/);
});
