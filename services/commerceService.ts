import { apiRequest } from "./apiService";
import {
  commerceSettingsSchema,
  commissionBatchListResponseSchema,
  commissionBatchDetailResponseSchema,
  commerceActionResponseSchema,
  CommerceSettings,
  UpdateCommerceSettings,
  CommissionBatchListResponse,
  CommissionBatchDetailResponse,
} from "../schemas/commerceSchema";

export async function fetchCommerceSettings(token: string): Promise<CommerceSettings> {
  return apiRequest("/api/v1/admin/commerce/settings", commerceSettingsSchema, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function updateCommerceSettings(
  token: string,
  data: UpdateCommerceSettings
): Promise<CommerceSettings> {
  return apiRequest("/api/v1/admin/commerce/settings", commerceSettingsSchema, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
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
    headers: { Authorization: `Bearer ${token}` },
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
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}

export async function markCommissionBatchPaid(token: string, id: number): Promise<void> {
  await apiRequest(
    `/api/v1/admin/commissions/batches/${id}/mark-paid`,
    commerceActionResponseSchema,
    {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}
