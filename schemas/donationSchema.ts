import { z } from "zod";

export const donationLedgerItemSchema = z.object({
  id: z.string(),
  org_id: z.string(),
  org_name: z.string().optional().default(""),
  campaign_id: z.number().nullable().optional(),
  campaign_title: z.string().nullable().optional(),
  payment_method: z.string(),
  amount_paise: z.number(),
  donor_name: z.string(),
  donor_phone_masked: z.string(),
  donor_email: z.string().nullable().optional(),
  donor_pan: z.string().nullable().optional(),
  tax_eligible: z.boolean(),
  financial_year: z.string(),
  payment_status: z.string(),
  reconciliation_status: z.string(),
  collected_by_agent_id: z.string().nullable().optional(),
  collection_proof_url: z.string().nullable().optional(),
  deposit_proof_url: z.string().nullable().optional(),
  reconciled_at: z.string().nullable().optional(),
  reconciled_by: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const donationLedgerResponseSchema = z.object({
  donations: z.array(donationLedgerItemSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

export type DonationLedgerItem = z.infer<typeof donationLedgerItemSchema>;
export type DonationLedgerResponse = z.infer<typeof donationLedgerResponseSchema>;
