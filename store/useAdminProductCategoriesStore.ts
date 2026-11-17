// src/store/useAdminProductCategoriesStore.ts
import { create } from "zustand";
import { ApiError } from "../services/apiService";
import { getErrorMessage } from "../lib/errors";
import {
  ProductCategoryItem,
  CreateProductCategoryRequest,
  UpdateProductCategoryRequest,
} from "../schemas/productCategorySchema";
import {
  fetchAdminProductCategories,
  createAdminProductCategory,
  updateAdminProductCategory,
  deleteAdminProductCategory,
} from "../services/productCategoryService";

interface AdminProductCategoriesState {
  categories: ProductCategoryItem[];
  verticalFilter: "all" | "paykop" | "farm";
  loading: boolean;
  error: string | null;

  setVerticalFilter: (filter: "all" | "paykop" | "farm") => void;
  fetchCategories: (getToken: () => Promise<string | null>, vertical?: "all" | "paykop" | "farm") => Promise<void>;
  createCategory: (
    getToken: () => Promise<string | null>,
    data: CreateProductCategoryRequest
  ) => Promise<void>;
  updateCategory: (
    getToken: () => Promise<string | null>,
    id: number,
    data: UpdateProductCategoryRequest
  ) => Promise<void>;
  deleteCategory: (
    getToken: () => Promise<string | null>,
    id: number
  ) => Promise<void>;
}

export const useAdminProductCategoriesStore = create<AdminProductCategoriesState>((set, get) => ({
  categories: [],
  verticalFilter: "all",
  loading: false,
  error: null,

  setVerticalFilter: (verticalFilter) => set({ verticalFilter }),

  fetchCategories: async (getToken, vertical) => {
    const targetVertical = vertical ?? get().verticalFilter;
    set({ loading: true, error: null });
    try {
      const token = await getToken();
      if (!token) throw new Error("No token");
      const resp = await fetchAdminProductCategories(token, targetVertical);
      set({ categories: Array.isArray(resp) ? resp : [], error: null });
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 404) {
        set({
          categories: [],
          error: "Product Categories API is not deployed on the backend (404). Track in sync inventory.",
        });
      } else {
        console.error("[Store] Failed to fetch product categories", err);
        set({ error: getErrorMessage(err, "Failed to fetch product categories") });
      }
    } finally {
      set({ loading: false });
    }
  },

  createCategory: async (getToken, data) => {
    try {
      const token = await getToken();
      if (!token) throw new Error("No token");
      await createAdminProductCategory(token, data);
      await get().fetchCategories(getToken);
    } catch (err: unknown) {
      console.error("[Store] Failed to create product category", err);
      if (err instanceof ApiError && err.status === 404) {
        throw new Error("Product Categories API is not yet available on the backend.");
      }
      throw err;
    }
  },

  updateCategory: async (getToken, id, data) => {
    try {
      const token = await getToken();
      if (!token) throw new Error("No token");
      await updateAdminProductCategory(token, id, data);
      await get().fetchCategories(getToken);
    } catch (err: unknown) {
      console.error("[Store] Failed to update product category", err);
      throw err;
    }
  },

  deleteCategory: async (getToken, id) => {
    try {
      const token = await getToken();
      if (!token) throw new Error("No token");
      await deleteAdminProductCategory(token, id);
      await get().fetchCategories(getToken);
    } catch (err: unknown) {
      console.error("[Store] Failed to delete product category", err);
      if (err instanceof ApiError && err.status === 404) {
        throw new Error("Product Categories API is not yet available on the backend.");
      }
      throw err;
    }
  },
}));
