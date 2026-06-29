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
  images: z.string().optional().default(""),
  status: z.string(),
});

export const productListResponseSchema = z.object({
  products: z.array(productResponseSchema),
  total: z.number(),
});

export type ProductResponse = z.infer<typeof productResponseSchema>;
export type ProductListResponse = z.infer<typeof productListResponseSchema>;

export const feedResponseSchema = z.object({
  featured_products: z.array(productResponseSchema),
  recommended_services: z.array(z.any()),
  urgent_donations: z.array(z.any()),
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
  status: z.string(),
});

export const adminProductListResponseSchema = z.object({
  products: z.array(adminProductListItemSchema),
  total: z.number(),
});

export type AdminProductListItem = z.infer<typeof adminProductListItemSchema>;
export type AdminProductListResponse = z.infer<typeof adminProductListResponseSchema>;
