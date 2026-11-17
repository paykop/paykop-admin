import type { BrowserContext, Page } from "@playwright/test";

const TEST_ACCESS_TOKEN =
  "eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjk5OTk5OTk5OTl9.sig";

export async function addAuthCookies(context: BrowserContext, baseURL: string) {
  await context.addCookies([
    { name: "access_token", value: TEST_ACCESS_TOKEN, url: baseURL },
    { name: "refresh_token", value: "refresh-test", url: baseURL },
  ]);
}

export async function mockAuthenticatedAdmin(page: Page) {
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

  await page.route("**/api/proxy/users/me/permissions", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        is_admin: true,
        is_seller: false,
        is_buyer: false,
        is_subscriber: false,
        is_onboarded: true,
      }),
    });
  });

  await page.route("**/api/proxy/notifications**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ notifications: [], total: 0 }),
    });
  });
}

export async function mockDashboardApis(page: Page) {
  await page.route("**/api/proxy/admin/dashboard**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        message: "ok",
        counts: {
          total_users: 0,
          buyers: 0,
          sellers: 0,
          agents: 0,
          admins: 1,
          pending_products: 0,
          approved_products: 0,
          rejected_products: 0,
        },
      }),
    });
  });

  await page.route("**/api/proxy/admin/metrics**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        auth_error_count: 0,
        geocode_call_count: 0,
        uptime_seconds: 0,
      }),
    });
  });
}

export async function mockUnauthenticatedSession(page: Page) {
  await page.route("**/api/auth/session", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ authenticated: false }),
    });
  });
}

export async function mockAuthenticatedSupport(page: Page) {
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

  await page.route("**/api/proxy/users/me/permissions", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        is_admin: false,
        is_seller: false,
        is_buyer: false,
        is_subscriber: false,
        is_onboarded: true,
      }),
    });
  });

  await page.route("**/api/proxy/notifications**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ notifications: [], total: 0 }),
    });
  });
}
