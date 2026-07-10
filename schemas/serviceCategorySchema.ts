// src/schemas/serviceCategorySchema.ts
import { z } from "zod";

export const serviceCategoryItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.string(),
  parent_id: z.number().nullable().optional(),
  icon: z.string().nullable().optional(),
  subtitle: z.string().nullable().optional(),
  icon_color: z.string().nullable().optional(),
  bg_color: z.string().nullable().optional(),
  is_featured: z.boolean().optional().default(false),
});

export const serviceCategoryListResponseSchema = z.object({
  categories: z.array(serviceCategoryItemSchema),
  total: z.number().optional(),
});

export const createServiceCategoryRequestSchema = z.object({
  name: z.string().max(100),
  type: z.string().max(50),
  parent_id: z.number().optional(),
  icon: z.string().optional(),
  subtitle: z.string().optional(),
  icon_color: z.string().optional(),
  bg_color: z.string().optional(),
  is_featured: z.boolean().optional(),
});

export const updateServiceCategoryRequestSchema = z.object({
  name: z.string().max(100).optional(),
  type: z.string().max(50).optional(),
  parent_id: z.number().optional(),
  icon: z.string().optional(),
  subtitle: z.string().optional(),
  icon_color: z.string().optional(),
  bg_color: z.string().optional(),
  is_featured: z.boolean().optional(),
});

export const serviceCategoryActionResponseSchema = z.object({
  message: z.string(),
});

export type ServiceCategoryItem = z.infer<typeof serviceCategoryItemSchema>;
export type ServiceCategoryListResponse = z.infer<typeof serviceCategoryListResponseSchema>;
export type CreateServiceCategoryRequest = z.infer<typeof createServiceCategoryRequestSchema>;
export type UpdateServiceCategoryRequest = z.infer<typeof updateServiceCategoryRequestSchema>;
export type ServiceCategoryActionResponse = z.infer<typeof serviceCategoryActionResponseSchema>;
