// src/schemas/productCategorySchema.ts
import { z } from "zod";

export interface ProductCategoryItem {
  id: number;
  name: string;
  vertical?: string | null;
  return_window_hours?: number | null;
  is_perishable?: boolean | null;
  parent_id?: number | null;
  image_url?: string | null;
  children?: ProductCategoryItem[];
  created_at?: string;
  updated_at?: string;
}

export const productCategoryItemSchema: z.ZodType<ProductCategoryItem> = z.lazy(() =>
  z.object({
    id: z.number(),
    name: z.string(),
    vertical: z.string().nullable().optional().default("paykop"),
    return_window_hours: z.number().nullable().optional().default(168),
    is_perishable: z.boolean().nullable().optional().default(false),
    parent_id: z.number().nullable().optional(),
    image_url: z.string().nullable().optional(),
    children: z.array(z.lazy(() => productCategoryItemSchema)).nullable().optional().transform((val) => val ?? []).default([]),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
  }).passthrough()
);

export const productCategoryListResponseSchema = z
  .union([
    z.array(productCategoryItemSchema),
    z.object({
      categories: z.array(productCategoryItemSchema).optional(),
      data: z.array(productCategoryItemSchema).optional(),
    }).transform((val) => val.categories ?? val.data ?? []),
    z.record(z.string(), z.unknown()).transform(() => []),
    z.null().transform(() => []),
    z.undefined().transform(() => []),
  ])
  .transform((val) => val ?? []);

export const createProductCategoryRequestSchema = z.object({
  name: z.string().max(100),
  parent_id: z.number().nullable().optional(),
  image_url: z.string().nullable().optional(),
  vertical: z.enum(["paykop", "farm"]).optional().default("paykop"),
  return_window_hours: z.number().min(0).optional().default(168),
  is_perishable: z.boolean().optional().default(false),
});

export const updateProductCategoryRequestSchema = z.object({
  name: z.string().max(100).optional(),
  parent_id: z.number().nullable().optional(),
  image_url: z.string().nullable().optional(),
  vertical: z.enum(["paykop", "farm"]).optional(),
  return_window_hours: z.number().min(0).optional(),
  is_perishable: z.boolean().optional(),
});

export const productCategoryActionResponseSchema = z.object({
  message: z.string(),
});

export type ProductCategoryListResponse = z.infer<typeof productCategoryListResponseSchema>;
export type CreateProductCategoryRequest = z.infer<typeof createProductCategoryRequestSchema>;
export type UpdateProductCategoryRequest = z.infer<typeof updateProductCategoryRequestSchema>;
export type ProductCategoryActionResponse = z.infer<typeof productCategoryActionResponseSchema>;
