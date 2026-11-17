// src/services/returnService.ts
import { apiRequest } from "./apiService";
import {
  returnListResponseSchema,
  returnItemSchema,
  ReturnItem,
  ReturnListResponse,
  AdminResolveInput,
} from "../schemas/returnSchema";

export interface FetchAdminReturnsParams {
  page?: number;
  limit?: number;
  status?: string;
}

/**
 * Fetch list of return requests for staff & admins.
 */
export async function fetchAdminReturns(
  _token: string,
  params: FetchAdminReturnsParams = {}
): Promise<ReturnListResponse> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.status && params.status !== "all") query.set("status", params.status);

  const queryString = query.toString();
  const endpoint = `/api/v1/admin/returns${queryString ? `?${queryString}` : ""}`;

  return apiRequest(endpoint, returnListResponseSchema);
}

/**
 * Fetch detailed view of a single return request.
 */
export async function fetchAdminReturnDetail(
  _token: string,
  id: number
): Promise<ReturnItem> {
  return apiRequest(`/api/v1/admin/returns/${id}`, returnItemSchema);
}

/**
 * Resolve an escalated or pending return request (admin only).
 */
export async function resolveAdminReturn(
  token: string,
  id: number,
  data: AdminResolveInput
): Promise<ReturnItem> {
  return apiRequest(`/api/v1/admin/returns/${id}/resolve`, returnItemSchema, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
