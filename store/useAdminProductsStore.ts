// src/store/useAdminProductsStore.ts
import { create } from "zustand";
import { AdminProductListItem as ProductListItem } from "../schemas/productSchema";
import { fetchAdminProducts, updateAdminProductStatus, approveAdminProduct, deleteAdminProduct } from "../services/productService";

interface AdminProductsStore {
  products: ProductListItem[];
  loading: boolean;
  error: string | null;
  fetchProducts: (getToken: () => Promise<string | null>, status?: string) => Promise<void>;
  updateProductStatus: (getToken: () => Promise<string | null>, id: number, status: string) => Promise<void>;
  approveProductAction: (getToken: () => Promise<string | null>, id: number) => Promise<void>;
  deleteProductAction: (getToken: () => Promise<string | null>, id: number) => Promise<void>;
}

export const useAdminProductsStore = create<AdminProductsStore>((set, get) => ({
  products: [],
  loading: false,
  error: null,
  fetchProducts: async (getToken, status) => {
    set({ loading: true, error: null });
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
      if (!token) return;
      console.log(`[Store] Updating status of product ${id} to ${status}`);
      await updateAdminProductStatus(token, id, status);
      await get().fetchProducts(getToken);
    } catch (err: any) {
      console.error("[Store] Failed to update product status", err);
    }
  },
  approveProductAction: async (getToken, id) => {
    try {
      const token = await getToken();
      if (!token) return;
      console.log(`[Store] Approving product ${id}`);
      await approveAdminProduct(token, id);
      await get().fetchProducts(getToken);
    } catch (err: any) {
      console.error("[Store] Failed to approve product", err);
    }
  },
  deleteProductAction: async (getToken, id) => {
    try {
      const token = await getToken();
      if (!token) return;
      console.log(`[Store] Deleting product ${id}`);
      await deleteAdminProduct(token, id);
      await get().fetchProducts(getToken);
    } catch (err: any) {
      console.error("[Store] Failed to delete product", err);
    }
  },
}));
