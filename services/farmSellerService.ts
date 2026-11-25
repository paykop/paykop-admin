import { apiRequest } from "./apiService";
import {
  farmSellerListResponseSchema,
  farmSellerActionResponseSchema,
  FarmSellerListResponse,
  FarmSellerActionResponse,
} from "../schemas/farmSellerSchema";

export async function fetchFarmSellers(
  _token: string,
  status?: string,
  search?: string
): Promise<FarmSellerListResponse> {
  const params: Record<string, string> = {};
  if (status && status !== "all") params.status = status;
  if (search && search.trim() !== "") params.search = search.trim();

  return apiRequest("/api/v1/farm/admin/sellers", farmSellerListResponseSchema, {
    params,
  });
}

export async function approveFarmSeller(
  _token: string,
  userId: string
): Promise<FarmSellerActionResponse> {
  return apiRequest(`/api/v1/farm/admin/sellers/${userId}/approve`, farmSellerActionResponseSchema, {
    method: "POST",
  });
}

export async function rejectFarmSeller(
  _token: string,
  userId: string
): Promise<FarmSellerActionResponse> {
  return apiRequest(`/api/v1/farm/admin/sellers/${userId}/reject`, farmSellerActionResponseSchema, {
    method: "POST",
  });
}
