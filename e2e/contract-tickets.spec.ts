import { test, expect } from "@playwright/test";
import { addAuthCookies, mockAuthenticatedAdmin } from "./helpers/auth";
import { ticketListFixture } from "./helpers/fixtures";

test("tickets tab renders list from proxied API contract", async ({ page, context, baseURL }) => {
  if (!baseURL) throw new Error("baseURL is required");
  await addAuthCookies(context, baseURL);
  await mockAuthenticatedAdmin(page);

  await page.route("**/api/proxy/admin/tickets**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(ticketListFixture),
    });
  });

  await page.goto("/tickets");
  await expect(page.getByText("Need help with order")).toBeVisible();
});
