import { apiRequest } from "./apiService";
import {
  bannerItemSchema,
  bannerActionResponseSchema,
  BannerItem,
  CreateBannerRequest,
  UpdateBannerRequest,
  BannerActionResponse,
  bannerListResponseSchema,
  BannerListResponse,
} from "../schemas/bannerSchema";

/**
 * Fetch all homepage banners (Admin)
 */
export async function fetchAdminBanners(token: string): Promise<BannerListResponse> {
  return apiRequest("/api/v1/admin/banners", bannerListResponseSchema, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Create a new homepage banner (Admin)
 * Requires Idempotency-Key header which is automatically added by apiRequest
 */
export async function createAdminBanner(
  token: string,
  data: CreateBannerRequest
): Promise<BannerItem> {
  return apiRequest("/api/v1/admin/banners", bannerItemSchema, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

/**
 * Full update of a homepage banner (Admin) — PUT
 * Requires Idempotency-Key header which is automatically added by apiRequest
 */
export async function updateAdminBanner(
  token: string,
  id: number,
  data: UpdateBannerRequest
): Promise<BannerItem> {
  return apiRequest(`/api/v1/admin/banners/${id}`, bannerItemSchema, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

/**
 * Soft-delete a homepage banner (Admin)
 */
export async function deleteAdminBanner(
  token: string,
  id: number
): Promise<BannerActionResponse> {
  return apiRequest(`/api/v1/admin/banners/${id}`, bannerActionResponseSchema, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
