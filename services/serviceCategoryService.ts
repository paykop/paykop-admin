// src/services/serviceCategoryService.ts
import { z } from "zod";
import { apiRequest } from "./apiService";
import {
  serviceCategoryListResponseSchema,
  serviceCategoryItemSchema,
  serviceCategoryActionResponseSchema,
  ServiceCategoryListResponse,
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
    headers: {
      Authorization: `Bearer ${token}`,
    },
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
    headers: {
      Authorization: `Bearer ${token}`,
    },
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
    headers: {
      Authorization: `Bearer ${token}`,
    },
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
    headers: {
      Authorization: `Bearer ${token}`,
    },
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
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
