import { apiRequest } from "./apiService";
import {
  commerceSettingsSchema,
  commissionBatchListResponseSchema,
  commissionBatchDetailResponseSchema,
  commerceActionResponseSchema,
  sellerCommissionOverrideSchema,
  CommerceSettings,
  UpdateCommerceSettings,
  CommissionBatchListResponse,
  CommissionBatchDetailResponse,
  SellerCommissionOverrideRequest,
  SellerCommissionOverride,
} from "../schemas/commerceSchema";

export async function fetchCommerceSettings(_token: string): Promise<CommerceSettings> {
  return apiRequest("/api/v1/admin/commerce/settings", commerceSettingsSchema, {
  });
}

export async function updateCommerceSettings(
  token: string,
  data: UpdateCommerceSettings
): Promise<CommerceSettings> {
  return apiRequest("/api/v1/admin/commerce/settings", commerceSettingsSchema, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function fetchCommissionBatches(
  token: string,
  page = 1,
  limit = 20,
  sellerId?: string
): Promise<CommissionBatchListResponse> {
  const params: Record<string, string> = {
    page: page.toString(),
    limit: limit.toString(),
  };
  if (sellerId) params.seller_id = sellerId;

  return apiRequest("/api/v1/admin/commissions/batches", commissionBatchListResponseSchema, {
    params,
  });
}

export async function fetchCommissionBatchDetail(
  token: string,
  id: number
): Promise<CommissionBatchDetailResponse> {
  return apiRequest(
    `/api/v1/admin/commissions/batches/${id}`,
    commissionBatchDetailResponseSchema,
    {
    }
  );
}

export async function markCommissionBatchPaid(token: string, id: number): Promise<void> {
  await apiRequest(
    `/api/v1/admin/commissions/batches/${id}/mark-paid`,
    commerceActionResponseSchema,
    {
      method: "PATCH",
    }
  );
}

export async function setSellerCommissionOverride(
  token: string,
  sellerId: string,
  data: SellerCommissionOverrideRequest
): Promise<SellerCommissionOverride> {
  return apiRequest(
    `/api/v1/admin/sellers/${sellerId}/commission-override`,
    sellerCommissionOverrideSchema,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

