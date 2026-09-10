import { z } from "zod";

export const payoutDestinationDTOSchema = z.object({
  account_number: z.string().min(6),
  ifsc: z.string().min(4),
  account_holder_name: z.string().min(2),
  bank_name: z.string().optional(),
});

export const organizationSchema = z.object({
  id: z.string(),
  legal_name: z.string(),
  org_type: z.string(),
  category: z.string(),
  registration_number: z.string().optional().nullable(),
  pan: z.string().optional().nullable(),
  is_80g_registered: z.boolean().default(false),
  cert_80g_url: z.string().optional().nullable(),
  cert_12a_url: z.string().optional().nullable(),
  registration_doc_url: z.string().optional().nullable(),
  authorized_signatory_name: z.string().optional().nullable(),
  authorized_signatory_id_url: z.string().optional().nullable(),
  kyc_status: z.string(),
  rejection_reason: z.string().optional().nullable(),
  city_id: z.number().optional().nullable(),
  logo_url: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  primary_contact_user_id: z.string().optional().nullable(),
  masked_payout_destination: z.string().optional().nullable(),
  verified_at: z.string().optional().nullable(),
  verified_by: z.string().optional().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
}).passthrough();

export const organizationListResponseSchema = z.object({
  organizations: z.array(organizationSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

export const createOrgRequestSchema = z.object({
  legal_name: z.string().min(2, "Legal name is required"),
  org_type: z.enum(["ngo", "trust", "section8_company", "individual_fundraiser"]),
  category: z.enum(["education", "health", "animal_welfare", "disaster_relief", "religious", "other"]),
  registration_number: z.string().optional(),
  pan: z.string().optional(),
  is_80g_registered: z.boolean().default(false),
  cert_80g_url: z.string().optional(),
  cert_12a_url: z.string().optional(),
  registration_doc_url: z.string().optional(),
  authorized_signatory_name: z.string().optional(),
  authorized_signatory_id_url: z.string().optional(),
  city_id: z.number().optional(),
  logo_url: z.string().optional(),
  description: z.string().optional(),
  primary_contact_user_id: z.string().optional(),
  payout_destination: payoutDestinationDTOSchema.optional(),
});

export const updateOrgKycRequestSchema = z.object({
  status: z.enum(["verified", "rejected"]),
  rejection_reason: z.string().optional(),
});

export type Organization = z.infer<typeof organizationSchema>;
export type OrganizationListResponse = z.infer<typeof organizationListResponseSchema>;
export type CreateOrgRequest = z.infer<typeof createOrgRequestSchema>;
export type UpdateOrgKycRequest = z.infer<typeof updateOrgKycRequestSchema>;
