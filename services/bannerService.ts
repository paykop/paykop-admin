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
 * Fetch all homepage banners (public list includes inactive when only_active=false)
 */
export async function fetchAdminBanners(_token: string): Promise<BannerListResponse> {
  return apiRequest("/api/v1/banners?only_active=false", bannerListResponseSchema);
}

/**
 * Fetch a single banner by ID (public)
 */
export async function fetchBanner(id: number): Promise<BannerItem> {
  return apiRequest(`/api/v1/banners/${id}`, bannerItemSchema);
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
  });
}
