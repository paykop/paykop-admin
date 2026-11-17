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
 * Fetch all product categories & subcategories (Admin), optionally filtered by vertical ('paykop' | 'farm')
 */
export async function fetchAdminProductCategories(
  _token: string,
  vertical?: string
): Promise<ProductCategoryItem[]> {
  const query = vertical && vertical !== "all" ? `?vertical=${encodeURIComponent(vertical)}` : "";
  return apiRequest(`/api/v1/admin/categories${query}`, productCategoryListResponseSchema);
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
    body: JSON.stringify(data),
  });
}

/**
 * Fetch a single product category by ID (Admin)
 */
export async function fetchAdminProductCategory(
  _token: string,
  id: number
): Promise<ProductCategoryItem> {
  return apiRequest(`/api/v1/admin/categories/${id}`, productCategoryItemSchema);
}

/**
 * Full update of a product category (Admin)
 */
export async function updateAdminProductCategory(
  token: string,
  id: number,
  data: UpdateProductCategoryRequest
): Promise<ProductCategoryItem> {
  return apiRequest(`/api/v1/admin/categories/${id}`, productCategoryItemSchema, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Partial update of a product category (Admin)
 */
export async function patchAdminProductCategory(
  token: string,
  id: number,
  data: UpdateProductCategoryRequest
): Promise<ProductCategoryItem> {
  return apiRequest(`/api/v1/admin/categories/${id}`, productCategoryItemSchema, {
    method: "PATCH",
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
  });
}
