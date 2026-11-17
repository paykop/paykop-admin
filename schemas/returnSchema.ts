// src/schemas/returnSchema.ts
import { z } from "zod";

export const returnAttachmentSchema = z.object({
  id: z.number(),
  file_key: z.string(),
  file_url: z.string(),
  created_at: z.string().optional(),
});

export const returnItemSchema = z.object({
  id: z.number(),
  order_id: z.number(),
  buyer_id: z.string(),
  seller_id: z.string(),
  resolution: z.string(), // "refund" | "replacement"
  reason_code: z.string(),
  reason_text: z.string().nullable().optional(),
  quantity: z.number().optional().default(1),
  quantity_milli: z.number().optional().default(1000),
  vertical: z.string().optional().default("paykop"), // "paykop" | "farm"
  status: z.string(), // "requested", "approved", "rejected", "received", "completed", "escalated", "cancelled"
  refund_amount_paise: z.number().optional().default(0),
  payment_id: z.number().nullable().optional(),
  inspection_ok: z.boolean().nullable().optional(),
  inspection_note: z.string().nullable().optional(),
  decision_note: z.string().nullable().optional(),
  decided_by: z.string().nullable().optional(),
  escalated_at: z.string().nullable().optional(),
  decided_at: z.string().nullable().optional(),
  received_at: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  attachments: z.array(returnAttachmentSchema).optional().default([]),
}).passthrough();

export const returnListResponseSchema = z.object({
  returns: z.array(returnItemSchema),
  total: z.number(),
  page: z.number().optional().default(1),
  limit: z.number().optional().default(20),
});

export const adminResolveInputSchema = z.object({
  decision: z.enum(["refund", "replacement", "reject"]),
  note: z.string().min(1, "Resolution note is required"),
});

export type ReturnAttachment = z.infer<typeof returnAttachmentSchema>;
export type ReturnItem = z.infer<typeof returnItemSchema>;
export type ReturnListResponse = z.infer<typeof returnListResponseSchema>;
export type AdminResolveInput = z.infer<typeof adminResolveInputSchema>;
