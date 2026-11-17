import { z } from "zod";

export const settlementPeriodSchema = z.enum(["weekly", "monthly", "yearly"]);

export const commerceSettingsSchema = z.object({
  default_commission_rate_bps: z.number(),
  default_settlement_period: settlementPeriodSchema,
  default_commission_tier_id: z.number().nullable().optional(),
  default_onboarding_fee: z.number(),
  max_seller_debit_paise: z.number().optional().default(250000),
  updated_at: z.string().optional(),
}).passthrough();

export const updateCommerceSettingsSchema = z.object({
  default_commission_rate_bps: z.number().min(0).max(10000).optional(),
  default_settlement_period: settlementPeriodSchema.optional(),
  default_commission_tier_id: z.number().nullable().optional(),
  default_onboarding_fee: z.number().min(0).optional(),
  max_seller_debit_paise: z.number().min(0).optional(),
});

export const commissionBatchItemSchema = z.object({
  id: z.number(),
  seller_id: z.string(),
  settlement_period: z.string(),
  period_start: z.string(),
  period_end: z.string(),
  total_gross: z.number(),
  total_platform_fee: z.number(),
  entry_count: z.number(),
  status: z.string(),
  paid_out_at: z.string().nullable().optional(),
  created_at: z.string().optional(),
}).passthrough();

export const commissionBatchListResponseSchema = z.object({
  batches: z.array(commissionBatchItemSchema),
  total: z.number(),
});

export const commissionEntryItemSchema = z.object({
  id: z.number(),
  payment_id: z.number(),
  seller_id: z.string(),
  gross_amount: z.number(),
  platform_fee: z.number(),
  seller_net: z.number(),
  commission_rate_bps: z.number(),
  entry_kind: z.enum(["sale", "cod_debit", "refund_reversal", "debt_payment"]).or(z.string()).optional(),
  reversal_of_entry_id: z.number().nullable().optional(),
  eligible_at: z.string().nullable().optional(),
  status: z.string(),
  created_at: z.string().optional(),
}).passthrough();

export const commissionBatchDetailResponseSchema = z.object({
  batch: commissionBatchItemSchema,
  entries: z.array(commissionEntryItemSchema),
});

export const commerceActionResponseSchema = z.object({
  status: z.string(),
});

export const sellerCommissionOverrideRequestSchema = z.object({
  commission_rate_bps: z.number().min(0).max(10000),
  reason: z.string().min(1, "Reason is required"),
  effective_from: z.string().optional(),
  effective_to: z.string().nullable().optional(),
});

export const sellerCommissionOverrideSchema = z.object({
  id: z.number(),
  seller_id: z.string(),
  commission_rate_bps: z.number(),
  reason: z.string(),
  created_by: z.string().optional(),
  effective_from: z.string().optional(),
  effective_to: z.string().nullable().optional(),
  created_at: z.string().optional(),
}).passthrough();

export type CommerceSettings = z.infer<typeof commerceSettingsSchema>;
export type UpdateCommerceSettings = z.infer<typeof updateCommerceSettingsSchema>;
export type CommissionBatchItem = z.infer<typeof commissionBatchItemSchema>;
export type CommissionBatchListResponse = z.infer<typeof commissionBatchListResponseSchema>;
export type CommissionEntryItem = z.infer<typeof commissionEntryItemSchema>;
export type CommissionBatchDetailResponse = z.infer<typeof commissionBatchDetailResponseSchema>;
export type SellerCommissionOverrideRequest = z.infer<typeof sellerCommissionOverrideRequestSchema>;
export type SellerCommissionOverride = z.infer<typeof sellerCommissionOverrideSchema>;

