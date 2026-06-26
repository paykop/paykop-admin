// src/services/productService.ts
import { z } from "zod";
import { apiRequest } from "./apiService";

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

/**
 * Fetch list of approved products from the backend (paginated)
 */
export async function fetchProducts(token: string, page = 1, limit = 10) {
  return apiRequest("/api/v1/products", productListResponseSchema, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      page: page.toString(),
      limit: limit.toString(),
    },
  });
}

/**
 * Fetch product detail by ID
 */
export async function fetchProductDetail(token: string, id: number) {
  return apiRequest(`/api/v1/products/${id}`, productResponseSchema, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export const feedResponseSchema = z.object({
  featured_products: z.array(productResponseSchema),
  recommended_services: z.array(z.any()),
  urgent_donations: z.array(z.any()),
});

export type FeedResponse = z.infer<typeof feedResponseSchema>;

/**
 * Fetch home feed containing featured products and recommendation placeholders
 */
export async function fetchHomeFeed(token: string) {
  return apiRequest("/api/v1/home", feedResponseSchema, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
