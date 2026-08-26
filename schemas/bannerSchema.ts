import { z } from "zod";

export const bannerItemSchema = z.object({
  id: z.number(),
  title: z.string().optional(),
  image_url: z.string(),
  type: z.string(),
  link_id: z.string().optional(),
  is_active: z.boolean(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const createBannerRequestSchema = z.object({
  title: z.string().optional(),
  image_url: z.string(),
  type: z.string(),
  link_id: z.string().optional(),
  is_active: z.boolean(),
});

export const updateBannerRequestSchema = z.object({
  title: z.string().optional(),
  image_url: z.string().optional(),
  type: z.string().optional(),
  link_id: z.string().optional(),
  is_active: z.boolean().optional(),
});

export const bannerActionResponseSchema = z.object({
  message: z.string(),
});

export const bannerListResponseSchema = z.union([
  z.object({
    banners: z.array(bannerItemSchema),
    total: z.number().optional(),
  }),
  z.array(bannerItemSchema).transform((banners) => ({
    banners,
    total: banners.length,
  })),
]);

export type BannerItem = z.infer<typeof bannerItemSchema>;
export type CreateBannerRequest = z.infer<typeof createBannerRequestSchema>;
export type UpdateBannerRequest = z.infer<typeof updateBannerRequestSchema>;
export type BannerActionResponse = z.infer<typeof bannerActionResponseSchema>;
export type BannerListResponse = z.infer<typeof bannerListResponseSchema>;
