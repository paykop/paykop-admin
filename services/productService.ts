import { apiRequest } from "./apiService";
import {
  adminProductListResponseSchema,
  AdminProductListResponse,
} from "../schemas/productSchema";
import { actionResponseSchema } from "../schemas/userSchema";

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
