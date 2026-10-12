import { z } from "zod";

export const payoutItemSchema = z.object({
  id: z.string(),
  org_id: z.string(),
  org_name: z.string().optional().default(""),
  amount_paise: z.number(),
  amount_inr: z.number().optional().default(0),
  payout_status: z.enum(["pending", "approved", "processing", "processed", "completed", "failed", "reversed", "rejected"]).or(z.string()),
  razorpayx_payout_id: z.string().nullable().optional(),
  period_start: z.string(),
  period_end: z.string(),
  initiated_by: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
}).passthrough();

export const payoutListResponseSchema = z.object({
  payouts: z.array(payoutItemSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

export const payoutPreviewResponseSchema = z.object({
  org_id: z.string(),
  org_name: z.string(),
  period_start: z.string(),
  period_end: z.string(),
  donation_count: z.number(),
  gross_amount_paise: z.number(),
  gross_amount_inr: z.number(),
  platform_fee_paise: z.number(),
  platform_fee_inr: z.number(),
  net_amount_paise: z.number(),
  net_amount_inr: z.number(),
  bank_account_masked: z.string(),
}).passthrough();


export type PayoutItem = z.infer<typeof payoutItemSchema>;
export type PayoutListResponse = z.infer<typeof payoutListResponseSchema>;
export type PayoutPreviewResponse = z.infer<typeof payoutPreviewResponseSchema>;
