// src/schemas/productSchema.ts
import { z } from "zod";

// Public Product Schemas
export const productResponseSchema = z.object({
  id: z.number(),
  seller_id: z.string(),
  title: z.string(),
  description: z.string().optional().default(""),
  price: z.number(),
  stock: z.number(),
  category: z.string().optional().default(""),
  // July 2026: images is now a native JSON array (was serialised string)
  images: z.union([z.array(z.string()), z.string()]).optional().default([]),
  status: z.string(),
  // July 2026: dynamic rating fields
  average_rating: z.number().optional().default(0),
  review_count: z.number().optional().default(0),
  // July 2026: reviews now included in GET /products/:id detail
  reviews: z.array(z.unknown()).optional().default([]),
});

export const productListResponseSchema = z.object({
  products: z.array(productResponseSchema),
  total: z.number(),
});

export type ProductResponse = z.infer<typeof productResponseSchema>;
export type ProductListResponse = z.infer<typeof productListResponseSchema>;

export const feedResponseSchema = z.object({
  featured_products: z.array(productResponseSchema),
  recommended_services: z.array(z.unknown()),
  urgent_donations: z.array(z.unknown()),
});

export type FeedResponse = z.infer<typeof feedResponseSchema>;

// Admin Product Schemas
export const adminProductListItemSchema = z.object({
  id: z.number(),
  seller_id: z.string(),
  title: z.string(),
  description: z.string().optional().default(""),
  price: z.number(),
  stock: z.number(),
  category: z.string().optional().default(""),
  delivery_scope: z.string().nullable().optional(),
  is_cod_allowed: z.boolean().optional().default(false),
  // July 2026: images as native JSON array
  images: z.union([z.array(z.string()), z.string()]).optional().default([]),
  status: z.string(),
  // July 2026: dynamic rating fields
  average_rating: z.number().optional().default(0),
  review_count: z.number().optional().default(0),
});

export const adminProductListResponseSchema = z.object({
  products: z.array(adminProductListItemSchema),
  total: z.number(),
});

export type AdminProductListItem = z.infer<typeof adminProductListItemSchema>;
export type AdminProductListResponse = z.infer<typeof adminProductListResponseSchema>;
