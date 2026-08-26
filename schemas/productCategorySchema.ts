// src/schemas/productCategorySchema.ts
import { z } from "zod";

export interface ProductCategoryItem {
  id: number;
  name: string;
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
    parent_id: z.number().nullable().optional(),
    image_url: z.string().nullable().optional(),
    children: z.array(z.lazy(() => productCategoryItemSchema)).optional().default([]),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
  })
);

export const productCategoryListResponseSchema = z
  .array(productCategoryItemSchema)
  .nullable()
  .optional()
  .transform((val) => val ?? []);

export const createProductCategoryRequestSchema = z.object({
  name: z.string().max(100),
  parent_id: z.number().nullable().optional(),
  image_url: z.string().nullable().optional(),
});

export const updateProductCategoryRequestSchema = z.object({
  name: z.string().max(100).optional(),
  parent_id: z.number().nullable().optional(),
  image_url: z.string().nullable().optional(),
});

export const productCategoryActionResponseSchema = z.object({
  message: z.string(),
});

export type ProductCategoryListResponse = z.infer<typeof productCategoryListResponseSchema>;
export type CreateProductCategoryRequest = z.infer<typeof createProductCategoryRequestSchema>;
export type UpdateProductCategoryRequest = z.infer<typeof updateProductCategoryRequestSchema>;
export type ProductCategoryActionResponse = z.infer<typeof productCategoryActionResponseSchema>;
