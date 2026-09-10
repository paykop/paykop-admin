import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  hashToken,
  getInFlightRefreshesCount,
  performTokenRefresh,
  getApiV1Url,
} from "./server";

describe("paykop-admin Server Auth Unit Tests (lib/auth/server.ts)", () => {
  it("Item 3a: hashToken uses SHA-256 hex encoding and never leaks raw tokens", () => {
    const rawSecret = "super-secret-refresh-token-value-12345";
    const hashed = hashToken(rawSecret);

    assert.equal(typeof hashed, "string");
    assert.equal(hashed.length, 64, "SHA-256 hex digest must be 64 characters");
    assert.match(hashed, /^[0-9a-f]{64}$/, "Must be valid hex string");
    assert.ok(!hashed.includes(rawSecret), "Hashed key must not contain raw secret material");

    // Deterministic hashing
    assert.equal(hashToken(rawSecret), hashed);
    // Distinct tokens produce distinct hashes
    assert.notEqual(hashToken("another-token"), hashed);
  });

  it("Item 3b: Concurrent refreshes with the same token deduplicate to a single upstream request", async () => {
    let upstreamCallCount = 0;
    const tokenA = "staff-refresh-token-user-a";

    const mockFetch: typeof fetch = async () => {
      upstreamCallCount++;
      // Simulate network roundtrip latency
      await new Promise((resolve) => setTimeout(resolve, 50));
      return new Response(
        JSON.stringify({
          access_token: "new-access-token-a",
          refresh_token: "new-rotated-refresh-token-a",
          expires_in: 900,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    };

    let successCalls = 0;
    const onSuccess = async (acc: string, ref: string) => {
      assert.equal(acc, "new-access-token-a");
      assert.equal(ref, "new-rotated-refresh-token-a");
      successCalls++;
    };

    // Fire 5 concurrent requests with tokenA
    const results = await Promise.all([
      performTokenRefresh(tokenA, { fetchFn: mockFetch, onSuccess }),
      performTokenRefresh(tokenA, { fetchFn: mockFetch, onSuccess }),
      performTokenRefresh(tokenA, { fetchFn: mockFetch, onSuccess }),
      performTokenRefresh(tokenA, { fetchFn: mockFetch, onSuccess }),
      performTokenRefresh(tokenA, { fetchFn: mockFetch, onSuccess }),
    ]);

    // All 5 callers receive the exact same new access token
    assert.equal(results.length, 5);
    for (const res of results) {
      assert.equal(res, "new-access-token-a");
    }

    // Upstream fetch was invoked EXACTLY ONCE
    assert.equal(upstreamCallCount, 1, "Upstream refresh must be single-flighted across concurrent calls");
    assert.equal(successCalls, 1, "onSuccess cookie setting called once for the shared response");

    // In-flight map is cleaned up after resolution
    assert.equal(getInFlightRefreshesCount(), 0, "In-flight map must be empty after completion");
  });

  it("Item 3c: Multi-tenant isolation — concurrent requests with different tokens do NOT collide", async () => {
    const upstreamCalls: string[] = [];

    const mockFetch: typeof fetch = async (url, init) => {
      const body = JSON.parse(init?.body as string) as { refresh_token: string };
      upstreamCalls.push(body.refresh_token);
      await new Promise((resolve) => setTimeout(resolve, 30));

      const isUserA = body.refresh_token.includes("user-a");
      return new Response(
        JSON.stringify({
          access_token: isUserA ? "acc-user-a" : "acc-user-b",
          refresh_token: isUserA ? "ref-user-a" : "ref-user-b",
          expires_in: 900,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    };

    const tokenA = "token-user-a";
    const tokenB = "token-user-b";
    const noopSuccess = async () => {};

    const [resA, resB] = await Promise.all([
      performTokenRefresh(tokenA, { fetchFn: mockFetch, onSuccess: noopSuccess }),
      performTokenRefresh(tokenB, { fetchFn: mockFetch, onSuccess: noopSuccess }),
    ]);

    assert.equal(resA, "acc-user-a");
    assert.equal(resB, "acc-user-b");
    assert.equal(upstreamCalls.length, 2, "Separate upstream requests must be issued for distinct users");
    assert.equal(getInFlightRefreshesCount(), 0);
  });

  it("Item 4: Strict contract enforcement — missing refresh_token triggers failure and returns null without reusing stale token", async () => {
    let failureCalled = false;

    const mockFetchMissingRefreshToken: typeof fetch = async () => {
      return new Response(
        JSON.stringify({
          access_token: "new-access-token-only",
          // refresh_token is missing!
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    };

    const result = await performTokenRefresh("old-stale-token", {
      fetchFn: mockFetchMissingRefreshToken,
      onFailure: async () => {
        failureCalled = true;
      },
    });

    assert.equal(result, null, "Must return null when refresh_token is missing from response");
    assert.equal(failureCalled, true, "onFailure (clearAuthCookies) must be invoked to reject partial token pair");
    assert.equal(getInFlightRefreshesCount(), 0);
  });

  it("Item 5: Redirect loop prevention — 401 response triggers onFailure and returns null cleanly", async () => {
    let failureCalled = false;

    const mockFetch401: typeof fetch = async () => {
      return new Response(
        JSON.stringify({
          error: "Staff session has expired. Please re-authenticate.",
          code: "STAFF_SESSION_EXPIRED",
          message: "Staff session has reached its 24-hour limit. Please re-authenticate.",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    };

    const result = await performTokenRefresh("expired-staff-token", {
      fetchFn: mockFetch401,
      onFailure: async () => {
        failureCalled = true;
      },
    });

    assert.equal(result, null, "Must return null on 401 so caller cleanly redirects to /sign-in");
    assert.equal(failureCalled, true, "Must call onFailure to purge stale cookies and break redirect loops");
    assert.equal(getInFlightRefreshesCount(), 0);
  });

  it("Canonical URL resolver: getApiV1Url appends /api/v1 idempotently", () => {
    const url = getApiV1Url();
    assert.ok(url.endsWith("/api/v1"), "URL must end with /api/v1");
    assert.ok(!url.endsWith("/api/v1/api/v1"), "URL must not duplicate /api/v1");
  });
});
