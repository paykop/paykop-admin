import { z } from "zod";

export const kycDocumentSchema = z.object({
  doc_type: z.string(),
  file_url: z.string(),
  file_key: z.string().optional(),
  content_type: z.string().optional(),
  uploaded_at: z.string().optional(),
}).passthrough();

export const kycSubmissionSchema = z.object({
  id: z.number(),
  seller_user_id: z.string(),
  status: z.string(),
  category_kind: z.string().optional().nullable(),
  primary_category_id: z.number().optional().nullable(),
  gstin: z.string().optional().nullable(),
  pan: z.string().optional().nullable(),
  documents: z.array(kycDocumentSchema).optional().default([]),
  rejection_reason: z.string().optional().nullable(),
  reviewed_by: z.string().optional().nullable(),
  reviewed_at: z.string().optional().nullable(),
  submitted_at: z.string().optional().nullable(),
  seller_name: z.string().optional().nullable(),
  first_name: z.string().optional().nullable(),
  last_name: z.string().optional().nullable(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
}).passthrough();

export const kycSubmissionListResponseSchema = z.object({
  submissions: z.array(kycSubmissionSchema),
  total: z.number(),
});

export const rejectKycRequestSchema = z.object({
  reason: z.string().min(1),
});

export type KycDocument = z.infer<typeof kycDocumentSchema>;
export type KycSubmission = z.infer<typeof kycSubmissionSchema>;
export type KycSubmissionListResponse = z.infer<typeof kycSubmissionListResponseSchema>;
export type RejectKycRequest = z.infer<typeof rejectKycRequestSchema>;
