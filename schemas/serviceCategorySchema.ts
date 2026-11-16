// src/schemas/serviceCategorySchema.ts
import { z } from "zod";

export interface ServiceCategoryItem {
  id: number;
  name: string;
  type: string;
  parent_id?: number | null;
  icon?: string | null;
  subtitle?: string | null;
  icon_color?: string | null;
  bg_color?: string | null;
  is_featured?: boolean;
  image_url?: string | null;
  children?: ServiceCategoryItem[];
}

export const serviceCategoryItemSchema: z.ZodType<ServiceCategoryItem> = z.lazy(() =>
  z.object({
    id: z.number(),
    name: z.string(),
    type: z.string(),
    parent_id: z.number().nullable().optional(),
    icon: z.string().nullable().optional(),
    subtitle: z.string().nullable().optional(),
    icon_color: z.string().nullable().optional(),
    bg_color: z.string().nullable().optional(),
    is_featured: z.boolean().optional().default(false),
    image_url: z.string().nullable().optional(),
    children: z.array(z.lazy(() => serviceCategoryItemSchema)).nullable().optional().transform((val) => val ?? []).default([]),
  }).passthrough()
);

export const serviceCategoryListResponseSchema = z
  .union([
    z.array(serviceCategoryItemSchema),
    z.object({
      categories: z.array(serviceCategoryItemSchema).optional(),
      data: z.array(serviceCategoryItemSchema).optional(),
    }).transform((val) => val.categories ?? val.data ?? []),
    z.record(z.string(), z.unknown()).transform(() => []),
    z.null().transform(() => []),
    z.undefined().transform(() => []),
  ])
  .transform((val) => val ?? []);

export const createServiceCategoryRequestSchema = z.object({
  name: z.string().max(100),
  type: z.string().max(50),
  parent_id: z.number().nullable().optional(),
  icon: z.string().optional(),
  subtitle: z.string().optional(),
  icon_color: z.string().optional(),
  bg_color: z.string().optional(),
  is_featured: z.boolean().optional(),
  image_url: z.string().nullable().optional(),
});

export const updateServiceCategoryRequestSchema = z.object({
  name: z.string().max(100).optional(),
  type: z.string().max(50).optional(),
  parent_id: z.number().nullable().optional(),
  icon: z.string().optional(),
  subtitle: z.string().optional(),
  icon_color: z.string().optional(),
  bg_color: z.string().optional(),
  is_featured: z.boolean().optional(),
  image_url: z.string().nullable().optional(),
});

export const serviceCategoryActionResponseSchema = z.object({
  message: z.string(),
});

export type ServiceCategoryListResponse = z.infer<typeof serviceCategoryListResponseSchema>;
export type CreateServiceCategoryRequest = z.infer<typeof createServiceCategoryRequestSchema>;
export type UpdateServiceCategoryRequest = z.infer<typeof updateServiceCategoryRequestSchema>;
export type ServiceCategoryActionResponse = z.infer<typeof serviceCategoryActionResponseSchema>;
