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
  token: string,
  page = 1,
  limit = 10,
  status?: string
): Promise<ServiceListResponse> {
  console.log(`[API] Fetching services Page: ${page}, Limit: ${limit}, Status: ${status}`);
  const params: Record<string, string> = {
    page: page.toString(),
    limit: limit.toString(),
  };
  if (status) {
    params.status = status;
  }

  return apiRequest("/api/v1/admin/services", serviceListResponseSchema, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params,
  });
}

/**
 * Update/moderate provider service status (Admin)
 */
export async function updateAdminServiceStatus(
  token: string,
  id: number,
  status: string
): Promise<ServiceStatusResponse> {
  console.log(`[API] Updating service ID: ${id} status to: ${status}`);
  return apiRequest(`/api/v1/admin/services/${id}/status`, serviceStatusResponseSchema, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
}
