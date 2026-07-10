import { z } from "zod";

export const subscriptionPlanSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.number(),
  duration_days: z.number(),
  is_active: z.boolean(),
});

export const createSubscriptionPlanRequestSchema = z.object({
  name: z.string(),
  price: z.number(),
  duration_days: z.number(),
  is_active: z.boolean().optional().default(true),
});

export const updateSubscriptionPlanRequestSchema = z.object({
  name: z.string().optional(),
  price: z.number().optional(),
  duration_days: z.number().optional(),
  is_active: z.boolean().optional(),
});

export const subscriptionHistoryItemSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  plan_id: z.number(),
  plan: z.string(),
  status: z.string(),
  starts_at: z.string(),
  expires_at: z.string(),
});

export const subscriptionHistoryResponseSchema = z.object({
  subscriptions: z.array(subscriptionHistoryItemSchema),
  total: z.number(),
});

export const subscriptionPlanActionResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
});

export type SubscriptionPlan = z.infer<typeof subscriptionPlanSchema>;
export type CreateSubscriptionPlanRequest = z.infer<typeof createSubscriptionPlanRequestSchema>;
export type UpdateSubscriptionPlanRequest = z.infer<typeof updateSubscriptionPlanRequestSchema>;
export type SubscriptionHistoryItem = z.infer<typeof subscriptionHistoryItemSchema>;
export type SubscriptionHistoryResponse = z.infer<typeof subscriptionHistoryResponseSchema>;
export type SubscriptionPlanActionResponse = z.infer<typeof subscriptionPlanActionResponseSchema>;
