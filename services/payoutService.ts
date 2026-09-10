import {
  PayoutListResponse,
  PayoutPreviewResponse,
  PayoutItem,
  payoutListResponseSchema,
  payoutPreviewResponseSchema,
  payoutItemSchema,
} from "../schemas/payoutSchema";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export async function fetchAdminPayouts(
  token: string,
  params?: {
    page?: number;
    limit?: number;
    status?: string;
    org_id?: string;
  }
): Promise<PayoutListResponse> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", params.page.toString());
  if (params?.limit) query.set("limit", params.limit.toString());
  if (params?.status && params.status !== "all") query.set("status", params.status);
  if (params?.org_id) query.set("org_id", params.org_id);

  const res = await fetch(`${API_BASE}/admin/payouts?${query.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch payouts: ${res.statusText}`);
  }

  const data = await res.json();
  return payoutListResponseSchema.parse(data);
}

export async function previewOrgPayout(
  token: string,
  orgId: string,
  periodStart: string,
  periodEnd: string
): Promise<PayoutPreviewResponse> {
  const res = await fetch(`${API_BASE}/admin/organizations/${orgId}/payouts/preview`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      period_start: periodStart,
      period_end: periodEnd,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to preview payout: ${res.statusText}`);
  }

  const data = await res.json();
  return payoutPreviewResponseSchema.parse(data);
}

export async function runOrgPayoutBatch(
  token: string,
  orgId: string,
  periodStart: string,
  periodEnd: string
): Promise<PayoutItem> {
  const res = await fetch(`${API_BASE}/admin/organizations/${orgId}/payouts/run`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      period_start: periodStart,
      period_end: periodEnd,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to run payout batch: ${res.statusText}`);
  }

  const data = await res.json();
  return payoutItemSchema.parse(data);
}

export async function approveAdminPayout(
  token: string,
  payoutId: string
): Promise<PayoutItem> {
  const res = await fetch(`${API_BASE}/admin/payouts/${payoutId}/approve`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to approve payout: ${res.statusText}`);
  }

  const data = await res.json();
  return payoutItemSchema.parse(data);
}
