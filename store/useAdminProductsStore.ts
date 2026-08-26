// src/store/useAdminProductsStore.ts
import { create } from "zustand";
import { AdminProductListItem as ProductListItem } from "../schemas/productSchema";
import { fetchAdminProducts, updateAdminProductStatus, deleteAdminProduct } from "../services/productService";

interface AdminProductsStore {
  products: ProductListItem[];
  loading: boolean;
  error: string | null;
  lastStatus?: string;
  fetchProducts: (getToken: () => Promise<string | null>, status?: string) => Promise<void>;
  updateProductStatus: (getToken: () => Promise<string | null>, id: number, status: string) => Promise<void>;
  deleteProductAction: (getToken: () => Promise<string | null>, id: number) => Promise<void>;
}

export const useAdminProductsStore = create<AdminProductsStore>((set, get) => ({
  products: [],
  loading: false,
  error: null,
  lastStatus: undefined,
  fetchProducts: async (getToken, status) => {
    set({ loading: true, error: null, lastStatus: status });
    try {
      const token = await getToken();
      if (!token) throw new Error("No token provided");
      const resp = await fetchAdminProducts(token, 1, 50, status);
      set({ products: resp.products || [], error: null });
    } catch (err: any) {
      console.error("Failed to fetch products", err);
      set({ error: err.message || "Failed to fetch products" });
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
    } catch (err: any) {
      console.error("[Store] Failed to update product status", err);
      set({ error: err.message || "Failed to update product status" });
      throw err;
    }
  },
  deleteProductAction: async (getToken, id) => {
    try {
      const token = await getToken();
      if (!token) throw new Error("No token provided");
      await deleteAdminProduct(token, id);
      await get().fetchProducts(getToken, get().lastStatus);
    } catch (err: any) {
      console.error("[Store] Failed to delete product", err);
      set({ error: err.message || "Failed to delete product" });
      throw err;
    }
  },
}));
