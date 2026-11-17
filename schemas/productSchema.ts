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
  stock_milli: z.number().optional().default(0),
  vertical: z.string().optional().default("paykop"),
  unit: z.string().optional().default("piece"),
  pack_size: z.number().optional().default(1),
  min_order_qty_milli: z.number().optional().default(1000),
  qty_step_milli: z.number().optional().default(1000),
  farm_name: z.string().nullable().optional(),
  origin_location: z.string().nullable().optional(),
  harvest_date: z.string().nullable().optional(),
  shelf_life_days: z.number().optional().default(7),
  farming_method: z.string().optional().default("natural"),
  is_tax_exempt: z.boolean().optional().default(false),
  category: z.string().optional().default(""),
  category_id: z.number().nullable().optional(),
  images: z.union([z.array(z.string()), z.string()]).optional().default([]),
  status: z.string(),
  gst_rate_bps: z.number().optional().default(1800),
  hsn_code: z.string().nullable().optional(),
  average_rating: z.number().optional().default(0),
  review_count: z.number().optional().default(0),
  reviews: z.array(z.unknown()).optional().default([]),
}).passthrough();

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
  stock_milli: z.number().optional().default(0),
  vertical: z.string().optional().default("paykop"),
  unit: z.string().optional().default("piece"),
  pack_size: z.number().optional().default(1),
  min_order_qty_milli: z.number().optional().default(1000),
  qty_step_milli: z.number().optional().default(1000),
  farm_name: z.string().nullable().optional(),
  origin_location: z.string().nullable().optional(),
  harvest_date: z.string().nullable().optional(),
  shelf_life_days: z.number().optional().default(7),
  farming_method: z.string().optional().default("natural"),
  is_tax_exempt: z.boolean().optional().default(false),
  category: z.string().optional().default(""),
  delivery_scope: z.string().nullable().optional(),
  is_cod_allowed: z.boolean().optional().default(false),
  gst_rate_bps: z.number().optional().default(1800),
  hsn_code: z.string().nullable().optional(),
  images: z.union([z.array(z.string()), z.string()]).optional().default([]),
  status: z.string(),
  average_rating: z.number().optional().default(0),
  review_count: z.number().optional().default(0),
}).passthrough();

export const adminProductListResponseSchema = z.object({
  products: z.array(adminProductListItemSchema),
  total: z.number(),
});

export type AdminProductListItem = z.infer<typeof adminProductListItemSchema>;
export type AdminProductListResponse = z.infer<typeof adminProductListResponseSchema>;
