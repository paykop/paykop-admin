import { create } from "zustand";
import { FarmSellerItem } from "../schemas/farmSellerSchema";
import { getErrorMessage } from "../lib/errors";
import {
  fetchFarmSellers,
  approveFarmSeller,
  rejectFarmSeller,
} from "../services/farmSellerService";

interface AdminFarmSellerStore {
  sellers: FarmSellerItem[];
  total: number;
  loading: boolean;
  actionLoadingId: string | null;
  error: string | null;
  statusFilter: string;
  searchQuery: string;
  setStatusFilter: (status: string) => void;
  setSearchQuery: (query: string) => void;
  fetchSellers: (
    getToken: () => Promise<string | null>,
    status?: string,
    search?: string
  ) => Promise<void>;
  approve: (
    getToken: () => Promise<string | null>,
    userId: string
  ) => Promise<void>;
  reject: (
    getToken: () => Promise<string | null>,
    userId: string
  ) => Promise<void>;
}

export const useAdminFarmSellerStore = create<AdminFarmSellerStore>((set, get) => ({
  sellers: [],
  total: 0,
  loading: false,
  actionLoadingId: null,
  error: null,
  statusFilter: "pending",
  searchQuery: "",

  setStatusFilter: (status) => set({ statusFilter: status }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  fetchSellers: async (getToken, status, search) => {
    set({ loading: true, error: null });
    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication token not found");
      const currentStatus = status !== undefined ? status : get().statusFilter;
      const currentSearch = search !== undefined ? search : get().searchQuery;
      const resp = await fetchFarmSellers(token, currentStatus, currentSearch);
      set({ sellers: resp.sellers || [], total: resp.total || 0 });
    } catch (err: unknown) {
      set({
        error: getErrorMessage(err, "Failed to load farm seller applications"),
        sellers: [],
      });
    } finally {
      set({ loading: false });
    }
  },

  approve: async (getToken, userId) => {
    set({ actionLoadingId: userId, error: null });
    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication token not found");
      await approveFarmSeller(token, userId);
      set((state) => ({
        sellers: state.sellers.map((s) =>
          s.user_id === userId
            ? { ...s, status: "active", approved_at: new Date().toISOString() }
            : s
        ),
      }));
    } catch (err: unknown) {
      throw err;
    } finally {
      set({ actionLoadingId: null });
    }
  },

  reject: async (getToken, userId) => {
    set({ actionLoadingId: userId, error: null });
    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication token not found");
      await rejectFarmSeller(token, userId);
      set((state) => ({
        sellers: state.sellers.map((s) =>
          s.user_id === userId ? { ...s, status: "rejected" } : s
        ),
      }));
    } catch (err: unknown) {
      throw err;
    } finally {
      set({ actionLoadingId: null });
    }
  },
}));
