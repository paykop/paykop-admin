// src/services/subscriptionService.ts
import { apiRequest } from "./apiService";
import { actionResponseSchema } from "../schemas/userSchema";

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
