// src/services/productService.ts
import { z } from "zod";
import { apiRequest } from "./apiService";
import {
  productListResponseSchema,
  productResponseSchema,
  feedResponseSchema,
  adminProductListResponseSchema,
  AdminProductListResponse,
} from "../schemas/productSchema";

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

// ==========================================
// ADMIN PRODUCT METHODS
// ==========================================

/**
 * Fetch products list (Admin)
 */
export async function fetchAdminProducts(token: string, page = 1, limit = 10, status?: string): Promise<AdminProductListResponse> {
  const params: Record<string, string> = {
    page: page.toString(),
    limit: limit.toString(),
  };
  if (status) params.status = status;

  return apiRequest("/api/v1/admin/products", adminProductListResponseSchema, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params,
  });
}

/**
 * Update product status (Admin)
 */
export async function updateAdminProductStatus(token: string, id: number, status: string): Promise<any> {
  return apiRequest(`/api/v1/admin/products/${id}/status`, z.any(), {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
}

/**
 * Approve a product (Admin)
 */
export async function approveAdminProduct(token: string, id: number): Promise<any> {
  console.log(`[API] Approving product ID: ${id}`);
  return apiRequest(`/api/v1/admin/products/${id}/approve`, z.any(), {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Delete a product (Admin)
 */
export async function deleteAdminProduct(token: string, id: number): Promise<any> {
  console.log(`[API] Deleting product ID: ${id}`);
  return apiRequest(`/api/v1/admin/products/${id}`, z.any(), {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
