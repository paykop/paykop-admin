// src/services/dashboardService.ts
import { apiRequest } from "./apiService";
import { dashboardResponseSchema, DashboardResponse } from "../schemas/dashboardSchema";

/**
 * Fetch dashboard statistics via /admin/dashboard
 */
export async function fetchDashboardStats(token: string): Promise<DashboardResponse> {
  return apiRequest("/api/v1/admin/dashboard", dashboardResponseSchema, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Fetch analytics statistics via /admin/analytics (July 2026 alias — identical response)
 */
export async function fetchAnalyticsStats(token: string): Promise<DashboardResponse> {
  return apiRequest("/api/v1/admin/analytics", dashboardResponseSchema, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

