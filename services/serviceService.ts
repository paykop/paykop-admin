// src/services/serviceService.ts
import { apiRequest } from "./apiService";
import {
  serviceListResponseSchema,
  serviceStatusResponseSchema,
  ServiceListResponse,
  ServiceStatusResponse,
} from "../schemas/serviceSchema";

/**
 * Fetch all provider services (Admin, paginated, with optional status filter)
 */
export async function fetchAdminServices(
  token?: string,
  page = 1,
  limit = 10,
  status?: string
): Promise<ServiceListResponse> {
  const params: Record<string, string> = {
    page: page.toString(),
    limit: limit.toString(),
  };
  if (status && status !== "all") {
    params.status = status;
  }

  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  return apiRequest("/api/v1/admin/services", serviceListResponseSchema, {
    headers,
    params,
  });
}

/**
 * Update/moderate provider service status (Admin) - approved, rejected, suspended, etc.
 */
export async function updateAdminServiceStatus(
  token: string | undefined,
  id: number | string,
  status: string
): Promise<ServiceStatusResponse> {
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  return apiRequest(`/api/v1/admin/services/${id}/status`, serviceStatusResponseSchema, {
    method: "PUT",
    headers,
    body: JSON.stringify({ status }),
  });
}
