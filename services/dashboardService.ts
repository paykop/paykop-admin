// src/services/dashboardService.ts
import { apiRequest } from "./apiService";
import {
  dashboardResponseSchema,
  DashboardResponse,
  adminMetricsSchema,
  AdminMetrics,
} from "../schemas/dashboardSchema";

/**
 * Fetch dashboard statistics via /admin/dashboard
 */
export async function fetchDashboardStats(_token: string): Promise<DashboardResponse> {
  return apiRequest("/api/v1/admin/dashboard", dashboardResponseSchema, {
  });
}

/**
 * Fetch operational diagnostics via /admin/metrics
 */
export async function fetchAdminMetrics(_token: string): Promise<AdminMetrics> {
  return apiRequest("/api/v1/admin/metrics", adminMetricsSchema, {
  });
}

/**
 * Fetch analytics statistics via /admin/analytics (alias of /admin/dashboard)
 */
export async function fetchAnalytics(_token: string): Promise<DashboardResponse> {
  return apiRequest("/api/v1/admin/analytics", dashboardResponseSchema);
}

