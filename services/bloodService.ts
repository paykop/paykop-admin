import { apiRequest } from "./apiService";
import { z } from "zod";
import {
  bloodRequestListResponseSchema,
  bloodRequestItemSchema,
  donorListResponseSchema,
  matchingDonorsResponseSchema,
  BloodRequestListResponse,
  BloodRequestItem,
  DonorListResponse,
  MatchingDonorsResponse,
} from "../schemas/bloodSchema";

/**
 * List all blood donation requests (paginated with optional status filter)
 */
export async function fetchBloodRequests(
  token?: string,
  page = 1,
  limit = 10,
  status?: string
): Promise<BloodRequestListResponse> {
  const params: Record<string, string> = {
    page: page.toString(),
    limit: limit.toString(),
  };
  if (status && status !== "all") {
    params.status = status;
  }

  const headers: Record<string, string> = {};return apiRequest("/api/v1/admin/blood", bloodRequestListResponseSchema, {
    headers,
    params,
  });
}

/**
 * Approve, reject, cancel, or mark a blood request as fulfilled (Admin)
 */
export async function updateBloodRequestStatus(
  token: string | undefined,
  id: string | number,
  status: string
): Promise<BloodRequestItem> {
  const headers: Record<string, string> = {};return apiRequest(`/api/v1/admin/blood/${id}/status`, bloodRequestItemSchema, {
    method: "PUT",
    headers,
    body: JSON.stringify({ status }),
  });
}

/**
 * Directly edit blood donation request fields (Admin)
 */
export async function updateBloodRequest(
  token: string | undefined,
  id: string | number,
  data: Record<string, unknown>
): Promise<BloodRequestItem> {
  const headers: Record<string, string> = {};return apiRequest(`/api/v1/admin/blood/${id}`, bloodRequestItemSchema, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });
}

/**
 * Delete (close) a blood donation request (Admin)
 */
export async function deleteBloodRequest(
  token: string | undefined,
  id: string | number
): Promise<{ message: string }> {
  const headers: Record<string, string> = {};return apiRequest(
    `/api/v1/admin/blood/${id}`,
    z.object({ message: z.string() }),
    {
      method: "DELETE",
      headers,
    }
  );
}

/**
 * View and manage pre-registered standing volunteer donors
 */
export async function fetchStandingDonors(
  token?: string,
  filters: { blood_type?: string; city_id?: string | number; only_available?: boolean } = {}
): Promise<DonorListResponse> {
  const params: Record<string, string> = {};
  if (filters.blood_type && filters.blood_type !== "all") {
    params.blood_type = filters.blood_type;
  }
  if (filters.city_id) {
    params.city_id = filters.city_id.toString();
  }
  if (filters.only_available !== undefined) {
    params.only_available = filters.only_available ? "true" : "false";
  }

  const headers: Record<string, string> = {};return apiRequest("/api/v1/donations/blood/donors", donorListResponseSchema, {
    headers,
    params,
  });
}

/**
 * Auto-suggest standing donors matching an active blood request
 */
export async function fetchMatchingDonors(
  token: string | undefined,
  requestId: string | number
): Promise<MatchingDonorsResponse> {
  const headers: Record<string, string> = {};return apiRequest(`/api/v1/donations/blood/${requestId}/matching-donors`, matchingDonorsResponseSchema, {
    headers,
  });
}
