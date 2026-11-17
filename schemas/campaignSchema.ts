import { z } from "zod";

export const campaignItemSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  type: z.string().optional().default("cash"),
  image_url: z.string().optional().default(""),
  target_amount: z.number().optional().default(0),
  is_urgent: z.boolean(),
  status: z.string(),
  created_at: z.string(),
  // July 2026: track which user raised the campaign (null for admin-created)
  creator_id: z.string().nullable().optional(),
});

export const campaignListResponseSchema = z.object({
  campaigns: z.array(campaignItemSchema),
  total: z.number(),
});

export const createCampaignRequestSchema = z.object({
  title: z.string(),
  description: z.string(),
  type: z.string().optional(),
  image_url: z.string().optional(),
  target_amount: z.number().optional().default(0),
  is_urgent: z.boolean().optional().default(false),
});

export const updateCampaignRequestSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  type: z.string().optional(),
  image_url: z.string().optional(),
  target_amount: z.number().optional(),
  is_urgent: z.boolean().optional(),
  status: z.string().optional(),
});

export const campaignActionResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
});

export type CampaignItem = z.infer<typeof campaignItemSchema>;
export type CampaignListResponse = z.infer<typeof campaignListResponseSchema>;
export type CreateCampaignRequest = z.infer<typeof createCampaignRequestSchema>;
export type UpdateCampaignRequest = z.infer<typeof updateCampaignRequestSchema>;
export type CampaignActionResponse = z.infer<typeof campaignActionResponseSchema>;
