// src/services/serviceCategoryService.ts
import { apiRequest } from "./apiService";
import {
  serviceCategoryListResponseSchema,
  serviceCategoryItemSchema,
  serviceCategoryActionResponseSchema,
  ServiceCategoryItem,
  CreateServiceCategoryRequest,
  UpdateServiceCategoryRequest,
  ServiceCategoryActionResponse,
} from "../schemas/serviceCategorySchema";

/**
 * Fetch all service categories (Admin)
 */
export async function fetchAdminServiceCategories(token: string): Promise<ServiceCategoryItem[]> {
  return apiRequest("/api/v1/admin/service-categories", serviceCategoryListResponseSchema, {
  });
}

/**
 * Create a new service category or subcategory (Admin)
 */
export async function createAdminServiceCategory(
  token: string,
  data: CreateServiceCategoryRequest
): Promise<ServiceCategoryItem> {
  return apiRequest("/api/v1/admin/service-categories", serviceCategoryItemSchema, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Full update of a service category (Admin) — PUT
 */
export async function updateAdminServiceCategory(
  token: string,
  id: number,
  data: UpdateServiceCategoryRequest
): Promise<ServiceCategoryItem> {
  return apiRequest(`/api/v1/admin/service-categories/${id}`, serviceCategoryItemSchema, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Partial update of a service category (Admin) — PATCH
 */
export async function patchAdminServiceCategory(
  token: string,
  id: number,
  data: UpdateServiceCategoryRequest
): Promise<ServiceCategoryItem> {
  return apiRequest(`/api/v1/admin/service-categories/${id}`, serviceCategoryItemSchema, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

/**
 * Soft-delete a service category or subcategory (Admin)
 */
export async function deleteAdminServiceCategory(
  token: string,
  id: number
): Promise<ServiceCategoryActionResponse> {
  return apiRequest(`/api/v1/admin/service-categories/${id}`, serviceCategoryActionResponseSchema, {
    method: "DELETE",
  });
}
