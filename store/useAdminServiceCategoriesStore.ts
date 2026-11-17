// src/store/useAdminServiceCategoriesStore.ts
import { create } from "zustand";
import { ApiError } from "../services/apiService";
import { getErrorMessage } from "../lib/errors";
import {
  ServiceCategoryItem,
  CreateServiceCategoryRequest,
  UpdateServiceCategoryRequest,
} from "../schemas/serviceCategorySchema";
import {
  fetchAdminServiceCategories,
  createAdminServiceCategory,
  updateAdminServiceCategory,
  patchAdminServiceCategory,
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
  patchCategory: (
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
      set({ categories: Array.isArray(resp) ? resp : [], error: null });
    } catch (err: unknown) {
      // 404 means endpoint not yet deployed — show empty state gracefully
      if (err instanceof ApiError && err.status === 404) {
        set({
          categories: [],
          error: "Service Categories API is not deployed on the backend (404). Track in sync inventory.",
        });
      } else {
        console.error("[Store] Failed to fetch service categories", err);
        set({ error: getErrorMessage(err, "Failed to fetch service categories") });
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
    } catch (err: unknown) {
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
    } catch (err: unknown) {
      console.error("[Store] Failed to update service category", err);
      throw err;
    }
  },

  patchCategory: async (getToken, id, data) => {
    try {
      const token = await getToken();
      if (!token) throw new Error("No token");
      await patchAdminServiceCategory(token, id, data);
      await get().fetchCategories(getToken);
    } catch (err: unknown) {
      console.error("[Store] Failed to patch service category", err);
      throw err;
    }
  },

  deleteCategory: async (getToken, id) => {
    try {
      const token = await getToken();
      if (!token) throw new Error("No token");
      await deleteAdminServiceCategory(token, id);
      await get().fetchCategories(getToken);
    } catch (err: unknown) {
      console.error("[Store] Failed to delete service category", err);
      if (err instanceof ApiError && err.status === 404) {
        throw new Error("Service Categories API is not yet available on the backend.");
      }
      throw err;
    }
  },
}));
