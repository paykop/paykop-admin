import { apiRequest } from "./apiService";
import {
  PayoutListResponse,
  PayoutPreviewResponse,
  PayoutItem,
  payoutListResponseSchema,
  payoutPreviewResponseSchema,
  payoutItemSchema,
} from "../schemas/payoutSchema";

export async function fetchAdminPayouts(
  _token: string,
  params?: {
    page?: number;
    limit?: number;
    status?: string;
    org_id?: string;
  }
): Promise<PayoutListResponse> {
  const queryParams: Record<string, string> = {};
  if (params?.page) queryParams.page = params.page.toString();
  if (params?.limit) queryParams.limit = params.limit.toString();
  if (params?.status && params.status !== "all") queryParams.status = params.status;
  if (params?.org_id) queryParams.org_id = params.org_id;

  return apiRequest("/api/v1/admin/payouts", payoutListResponseSchema, {
    params: queryParams,
  });
}

export async function fetchAdminPayout(
  _token: string,
  id: string
): Promise<PayoutItem> {
  return apiRequest(`/api/v1/admin/payouts/${id}`, payoutItemSchema);
}

export async function previewOrgPayout(
  _token: string,
  orgId: string,
  periodStart: string,
  periodEnd: string
): Promise<PayoutPreviewResponse> {
  return apiRequest(
    `/api/v1/admin/organizations/${orgId}/payouts/preview`,
    payoutPreviewResponseSchema,
    {
      method: "POST",
      body: JSON.stringify({
        period_start: periodStart,
        period_end: periodEnd,
      }),
    }
  );
}

export async function runOrgPayoutBatch(
  _token: string,
  orgId: string,
  periodStart: string,
  periodEnd: string
): Promise<PayoutItem> {
  return apiRequest(
    `/api/v1/admin/organizations/${orgId}/payouts/run`,
    payoutItemSchema,
    {
      method: "POST",
      body: JSON.stringify({
        period_start: periodStart,
        period_end: periodEnd,
      }),
    }
  );
}

export async function approveAdminPayout(
  _token: string,
  payoutId: string
): Promise<PayoutItem> {
  return apiRequest(
    `/api/v1/admin/payouts/${payoutId}/approve`,
    payoutItemSchema,
    {
      method: "PATCH",
    }
  );
}

