import { apiRequest } from "./apiService";
import {
  productListResponseSchema,
  productResponseSchema,
  feedResponseSchema,
  adminProductListResponseSchema,
  AdminProductListResponse,
} from "../schemas/productSchema";
import { actionResponseSchema } from "../schemas/userSchema";

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
 * Update product status (Admin) — approved | rejected | removed
 */
export async function updateAdminProductStatus(token: string, id: number, status: string) {
  return apiRequest(`/api/v1/admin/products/${id}/status`, actionResponseSchema, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
}

/**
 * Delete a product (Admin)
 */
export async function deleteAdminProduct(token: string, id: number) {
  return apiRequest(`/api/v1/admin/products/${id}`, actionResponseSchema, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
