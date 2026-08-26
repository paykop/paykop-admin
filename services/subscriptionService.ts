// src/services/subscriptionService.ts
import { z } from "zod";
import { apiRequest } from "./apiService";
import { actionResponseSchema } from "../schemas/userSchema";
import {
  subscriptionPlanSchema,
  subscriptionPlanActionResponseSchema,
  subscriptionHistoryResponseSchema,
  reconciliationListResponseSchema,
  CreateSubscriptionPlanRequest,
  UpdateSubscriptionPlanRequest,
  SubscriptionPlan,
  SubscriptionPlanActionResponse,
  SubscriptionHistoryResponse,
  ReconciliationListResponse,
} from "../schemas/subscriptionSchema";

/**
 * Activate subscription (promotes the logged-in buyer to a seller role)
 */
export async function activateSubscription(token: string) {
  return apiRequest("/api/v1/subscriptions/activate", actionResponseSchema, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Cancel subscription (reverts the active seller role back to buyer)
 */
export async function cancelSubscription(token: string) {
  return apiRequest("/api/v1/subscriptions/cancel", actionResponseSchema, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// ==========================================
// ADMIN SUBSCRIPTION METHODS
// ==========================================

/**
 * Create a new subscription plan/tier (Admin)
 */
export async function createSubscriptionPlan(
  token: string,
  data: CreateSubscriptionPlanRequest
): Promise<SubscriptionPlan> {
  console.log(`[API] Creating subscription plan:`, data);
  return apiRequest("/api/v1/admin/subscriptions", subscriptionPlanSchema, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

/**
 * Update an existing subscription plan/tier (Admin)
 */
export async function updateSubscriptionPlan(
  token: string,
  id: string | number,
  data: UpdateSubscriptionPlanRequest
): Promise<SubscriptionPlan> {
  console.log(`[API] Updating subscription plan ID: ${id}`, data);
  return apiRequest(`/api/v1/admin/subscriptions/${id}`, subscriptionPlanSchema, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

/**
 * Delete a subscription plan tier (Admin)
 */
export async function deleteSubscriptionPlan(
  token: string,
  id: string | number
): Promise<SubscriptionPlanActionResponse> {
  console.log(`[API] Deleting subscription plan ID: ${id}`);
  return apiRequest(`/api/v1/admin/subscriptions/${id}`, subscriptionPlanActionResponseSchema, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Fetch subscription events history logs (Admin, paginated)
 */
export async function fetchSubscriptionHistory(
  token: string,
  page = 1,
  limit = 10
): Promise<SubscriptionHistoryResponse> {
  console.log(`[API] Fetching subscription history Page: ${page}`);
  return apiRequest("/api/v1/admin/subscriptions/history", subscriptionHistoryResponseSchema, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      page: page.toString(),
      limit: limit.toString(),
    },
  });
}

/**
 * Fetch all registered subscription plans (Admin)
 */
export async function fetchSubscriptionPlans(token: string): Promise<SubscriptionPlan[]> {
  return apiRequest("/api/v1/admin/subscriptions/plans", z.array(subscriptionPlanSchema), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Fetch unresolved subscription reconciliation queue (Admin)
 */
export async function fetchSubscriptionReconciliations(
  token: string,
  page = 1,
  limit = 20
): Promise<ReconciliationListResponse> {
  return apiRequest("/api/v1/admin/subscriptions/reconciliation", reconciliationListResponseSchema, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      page: page.toString(),
      limit: limit.toString(),
    },
  });
}

/**
 * Resolve a reconciliation item by mapping to a local plan (Admin)
 */
export async function resolveSubscriptionReconciliation(
  token: string,
  id: number,
  planId: number
): Promise<SubscriptionPlanActionResponse> {
  return apiRequest(
    `/api/v1/admin/subscriptions/reconciliation/${id}/resolve`,
    subscriptionPlanActionResponseSchema,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ plan_id: planId }),
    }
  );
}


