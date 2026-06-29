// src/services/dashboardService.ts
import { apiRequest } from "./apiService";
import { dashboardResponseSchema, DashboardResponse } from "../schemas/dashboardSchema";

/**
 * Fetch dashboard statistics
 */
export async function fetchDashboardStats(token: string): Promise<DashboardResponse> {
  return apiRequest("/api/v1/admin/dashboard", dashboardResponseSchema, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
