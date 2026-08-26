// src/store/useAdminServiceCategoriesStore.ts
import { create } from "zustand";
import { ApiError } from "../services/apiService";
import {
  ServiceCategoryItem,
  CreateServiceCategoryRequest,
  UpdateServiceCategoryRequest,
} from "../schemas/serviceCategorySchema";
import {
  fetchAdminServiceCategories,
  createAdminServiceCategory,
  updateAdminServiceCategory,
  deleteAdminServiceCategory,
} from "../services/serviceCategoryService";

interface AdminServiceCategoriesState {
  categories: ServiceCategoryItem[];
  loading: boolean;
  error: string | null;

  fetchCategories: (getToken: () => Promise<string | null>) => Promise<void>;
  createCategory: (
    getToken: () => Promise<string | null>,
    data: CreateServiceCategoryRequest
  ) => Promise<void>;
  updateCategory: (
    getToken: () => Promise<string | null>,
    id: number,
    data: UpdateServiceCategoryRequest
  ) => Promise<void>;
  deleteCategory: (
    getToken: () => Promise<string | null>,
    id: number
  ) => Promise<void>;
}

export const useAdminServiceCategoriesStore = create<AdminServiceCategoriesState>((set, get) => ({
  categories: [],
  loading: false,
  error: null,

  fetchCategories: async (getToken) => {
    set({ loading: true, error: null });
    try {
      const token = await getToken();
      if (!token) throw new Error("No token");
      const resp = await fetchAdminServiceCategories(token);
      set({ categories: Array.isArray(resp) ? resp : (resp as any)?.categories || [], error: null });
    } catch (err: any) {
      // 404 means endpoint not yet deployed — show empty state gracefully
      if (err instanceof ApiError && err.status === 404) {
        console.warn("[Store] Service categories endpoint not available yet (404)");
        set({ categories: [], error: null });
      } else {
        console.error("[Store] Failed to fetch service categories", err);
        set({ error: err.message || "Failed to fetch service categories" });
      }
    } finally {
      set({ loading: false });
    }
  },

  createCategory: async (getToken, data) => {
    try {
      const token = await getToken();
      if (!token) throw new Error("No token");
      await createAdminServiceCategory(token, data);
      await get().fetchCategories(getToken);
    } catch (err: any) {
      console.error("[Store] Failed to create service category", err);
      if (err instanceof ApiError && err.status === 404) {
        throw new Error("Service Categories API is not yet available on the backend.");
      }
      throw err;
    }
  },

  updateCategory: async (getToken, id, data) => {
    try {
      const token = await getToken();
      if (!token) throw new Error("No token");
      await updateAdminServiceCategory(token, id, data);
      await get().fetchCategories(getToken);
    } catch (err: any) {
      console.error("[Store] Failed to update service category", err);
      throw err;
    }
  },

  deleteCategory: async (getToken, id) => {
    try {
      const token = await getToken();
      if (!token) throw new Error("No token");
      await deleteAdminServiceCategory(token, id);
      await get().fetchCategories(getToken);
    } catch (err: any) {
      console.error("[Store] Failed to delete service category", err);
      if (err instanceof ApiError && err.status === 404) {
        throw new Error("Service Categories API is not yet available on the backend.");
      }
      throw err;
    }
  },
}));
