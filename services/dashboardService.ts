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
export async function fetchDashboardStats(token: string): Promise<DashboardResponse> {
  return apiRequest("/api/v1/admin/dashboard", dashboardResponseSchema, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Fetch operational diagnostics via /admin/metrics
 */
export async function fetchAdminMetrics(token: string): Promise<AdminMetrics> {
  return apiRequest("/api/v1/admin/metrics", adminMetricsSchema, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
