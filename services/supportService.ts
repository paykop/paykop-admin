import { apiRequest } from "./apiService";
import { userDetailsResponseSchema } from "../schemas/userSchema";
import {
  supportListResponseSchema,
  supportActionResponseSchema,
  CreateSupportRequest,
  SupportListResponse,
  SupportActionResponse,
  SupportDetailResponse,
} from "../schemas/supportSchema";

export async function fetchSupportStaff(
  token: string,
  page = 1,
  limit = 50
): Promise<SupportListResponse> {
  return apiRequest("/api/v1/admin/support", supportListResponseSchema, {
    headers: { Authorization: `Bearer ${token}` },
    params: { page: page.toString(), limit: limit.toString() },
  });
}

export async function fetchSupportDetail(
  token: string,
  id: string
): Promise<SupportDetailResponse> {
  return apiRequest(`/api/v1/admin/support/${id}`, userDetailsResponseSchema, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createSupportStaff(
  token: string,
  data: CreateSupportRequest
): Promise<SupportDetailResponse> {
  return apiRequest("/api/v1/admin/support", userDetailsResponseSchema, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

export async function revokeSupportRole(
  token: string,
  id: string
): Promise<SupportActionResponse> {
  return apiRequest(`/api/v1/admin/support/${id}/revoke-role`, supportActionResponseSchema, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
}
