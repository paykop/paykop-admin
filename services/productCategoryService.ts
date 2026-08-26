// src/services/productCategoryService.ts
import { apiRequest } from "./apiService";
import {
  productCategoryListResponseSchema,
  productCategoryItemSchema,
  productCategoryActionResponseSchema,
  ProductCategoryItem,
  CreateProductCategoryRequest,
  UpdateProductCategoryRequest,
  ProductCategoryActionResponse,
} from "../schemas/productCategorySchema";

/**
 * Fetch all product categories & subcategories (Admin)
 */
export async function fetchAdminProductCategories(token: string): Promise<ProductCategoryItem[]> {
  return apiRequest("/api/v1/admin/categories", productCategoryListResponseSchema, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Create a new product category or subcategory (Admin)
 */
export async function createAdminProductCategory(
  token: string,
  data: CreateProductCategoryRequest
): Promise<ProductCategoryItem> {
  return apiRequest("/api/v1/admin/categories", productCategoryItemSchema, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

/**
 * Full/partial update of a product category (Admin)
 */
export async function updateAdminProductCategory(
  token: string,
  id: number,
  data: UpdateProductCategoryRequest
): Promise<ProductCategoryItem> {
  return apiRequest(`/api/v1/admin/categories/${id}`, productCategoryItemSchema, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

/**
 * Delete a product category or subcategory (Admin)
 */
export async function deleteAdminProductCategory(
  token: string,
  id: number
): Promise<ProductCategoryActionResponse> {
  return apiRequest(`/api/v1/admin/categories/${id}`, productCategoryActionResponseSchema, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
