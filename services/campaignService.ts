import { apiRequest } from "./apiService";
import {
  campaignListResponseSchema,
  campaignItemSchema,
  campaignActionResponseSchema,
  CampaignListResponse,
  CampaignItem,
  CreateCampaignRequest,
  UpdateCampaignRequest,
  CampaignActionResponse,
} from "../schemas/campaignSchema";

/**
 * List all donation campaigns (paginated)
 */
export async function fetchCampaigns(
  token: string,
  page = 1,
  limit = 10
): Promise<CampaignListResponse> {
  console.log(`[API] Fetching campaigns Page: ${page}`);
  return apiRequest("/api/v1/admin/campaigns", campaignListResponseSchema, {
    params: {
      page: page.toString(),
      limit: limit.toString(),
    },
  });
}

/**
 * Create a new donation campaign (Admin)
 */
export async function createCampaign(
  token: string,
  data: CreateCampaignRequest
): Promise<CampaignItem> {
  console.log(`[API] Creating campaign:`, data);
  return apiRequest("/api/v1/admin/campaigns", campaignItemSchema, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Update an existing campaign's details or moderation status (Admin)
 */
export async function updateCampaign(
  token: string,
  id: string | number,
  data: UpdateCampaignRequest
): Promise<CampaignItem> {
  console.log(`[API] Updating campaign ID: ${id}`, data);
  return apiRequest(`/api/v1/admin/campaigns/${id}`, campaignItemSchema, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Soft-delete a campaign (Admin)
 */
export async function deleteCampaign(
  token: string,
  id: string | number
): Promise<CampaignActionResponse> {
  console.log(`[API] Deleting campaign ID: ${id}`);
  return apiRequest(`/api/v1/admin/campaigns/${id}`, campaignActionResponseSchema, {
    method: "DELETE",
  });
}
