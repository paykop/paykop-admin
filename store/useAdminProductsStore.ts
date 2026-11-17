// src/store/useAdminProductsStore.ts
import { create } from "zustand";
import { AdminProductListItem as ProductListItem } from "../schemas/productSchema";
import { fetchAdminProducts, updateAdminProductStatus, deleteAdminProduct } from "../services/productService";
import { getErrorMessage } from "../lib/errors";

interface AdminProductsStore {
  products: ProductListItem[];
  verticalFilter: "all" | "paykop" | "farm";
  loading: boolean;
  error: string | null;
  lastStatus?: string;
  setVerticalFilter: (filter: "all" | "paykop" | "farm") => void;
  fetchProducts: (getToken: () => Promise<string | null>, status?: string) => Promise<void>;
  updateProductStatus: (getToken: () => Promise<string | null>, id: number, status: string) => Promise<void>;
  deleteProductAction: (getToken: () => Promise<string | null>, id: number) => Promise<void>;
}

export const useAdminProductsStore = create<AdminProductsStore>((set, get) => ({
  products: [],
  verticalFilter: "all",
  loading: false,
  error: null,
  lastStatus: undefined,
  setVerticalFilter: (verticalFilter) => set({ verticalFilter }),
  fetchProducts: async (getToken, status) => {
    set({ loading: true, error: null, lastStatus: status });
    try {
      const token = await getToken();
      if (!token) throw new Error("No token provided");
      const resp = await fetchAdminProducts(token, 1, 50, status);
      set({ products: resp.products || [], error: null });
    } catch (err: unknown) {
      console.error("Failed to fetch products", err);
      set({ error: getErrorMessage(err, "Failed to fetch products") });
    } finally {
      set({ loading: false });
    }
  },
  updateProductStatus: async (getToken, id, status) => {
    try {
      const token = await getToken();
      if (!token) throw new Error("No token provided");
      await updateAdminProductStatus(token, id, status);
      await get().fetchProducts(getToken, get().lastStatus);
    } catch (err: unknown) {
      console.error("[Store] Failed to update product status", err);
      set({ error: getErrorMessage(err, "Failed to update product status") });
      throw err;
    }
  },
  deleteProductAction: async (getToken, id) => {
    try {
      const token = await getToken();
      if (!token) throw new Error("No token provided");
      await deleteAdminProduct(token, id);
      await get().fetchProducts(getToken, get().lastStatus);
    } catch (err: unknown) {
      console.error("[Store] Failed to delete product", err);
      set({ error: getErrorMessage(err, "Failed to delete product") });
      throw err;
    }
  },
}));
