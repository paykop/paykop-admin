import { apiRequest } from "./apiService";
import {
  bloodRequestListResponseSchema,
  bloodRequestItemSchema,
  BloodRequestListResponse,
  BloodRequestItem,
} from "../schemas/bloodSchema";

/**
 * List all blood donation requests (paginated)
 */
export async function fetchBloodRequests(
  token: string,
  page = 1,
  limit = 10
): Promise<BloodRequestListResponse> {
  console.log(`[API] Fetching blood requests Page: ${page}`);
  return apiRequest("/api/v1/admin/blood", bloodRequestListResponseSchema, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      page: page.toString(),
      limit: limit.toString(),
    },
  });
}

/**
 * Approve, reject, or mark a blood request as fulfilled (Admin)
 */
export async function updateBloodRequestStatus(
  token: string,
  id: string | number,
  status: string
): Promise<BloodRequestItem> {
  console.log(`[API] Updating status of blood request ID: ${id} to ${status}`);
  return apiRequest(`/api/v1/admin/blood/${id}/status`, bloodRequestItemSchema, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
}
