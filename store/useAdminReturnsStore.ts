// src/store/useAdminReturnsStore.ts
import { create } from "zustand";
import { ReturnItem, AdminResolveInput } from "../schemas/returnSchema";
import { fetchAdminReturns, resolveAdminReturn, fetchAdminReturnDetail } from "../services/returnService";
import { getErrorMessage } from "../lib/errors";

interface AdminReturnsState {
  returns: ReturnItem[];
  total: number;
  page: number;
  limit: number;
  statusFilter: string;
  verticalFilter: "all" | "paykop" | "farm";
  selectedReturn: ReturnItem | null;
  loading: boolean;
  resolving: boolean;
  error: string | null;

  setStatusFilter: (status: string) => void;
  setVerticalFilter: (vertical: "all" | "paykop" | "farm") => void;
  setPage: (page: number) => void;
  selectReturn: (item: ReturnItem | null) => void;

  fetchReturns: (
    getToken: () => Promise<string | null>,
    page?: number,
    status?: string
  ) => Promise<void>;

  fetchReturnDetail: (
    getToken: () => Promise<string | null>,
    id: number
  ) => Promise<void>;

  resolveReturnAction: (
    getToken: () => Promise<string | null>,
    id: number,
    data: AdminResolveInput
  ) => Promise<void>;
}

export const useAdminReturnsStore = create<AdminReturnsState>((set, get) => ({
  returns: [],
  total: 0,
  page: 1,
  limit: 20,
  statusFilter: "all",
  verticalFilter: "all",
  selectedReturn: null,
  loading: false,
  resolving: false,
  error: null,

  setStatusFilter: (statusFilter) => set({ statusFilter, page: 1 }),
  setVerticalFilter: (verticalFilter) => set({ verticalFilter }),
  setPage: (page) => set({ page }),
  selectReturn: (selectedReturn) => set({ selectedReturn }),

  fetchReturns: async (getToken, page, status) => {
    const targetPage = page ?? get().page;
    const targetStatus = status ?? get().statusFilter;
    set({ loading: true, error: null });

    try {
      const token = await getToken();
      if (!token) throw new Error("No token provided");

      const resp = await fetchAdminReturns(token, {
        page: targetPage,
        limit: get().limit,
        status: targetStatus,
      });

      set({
        returns: resp.returns || [],
        total: resp.total || 0,
        page: resp.page || targetPage,
        error: null,
      });
    } catch (err: unknown) {
      console.error("[Store] Failed to fetch returns", err);
      set({ error: getErrorMessage(err, "Failed to fetch return requests") });
    } finally {
      set({ loading: false });
    }
  },

  fetchReturnDetail: async (getToken, id) => {
    try {
      const token = await getToken();
      if (!token) throw new Error("No token provided");
      const item = await fetchAdminReturnDetail(token, id);
      set({ selectedReturn: item });
    } catch (err: unknown) {
      console.error("[Store] Failed to fetch return detail", err);
    }
  },

  resolveReturnAction: async (getToken, id, data) => {
    set({ resolving: true });
    try {
      const token = await getToken();
      if (!token) throw new Error("No token provided");

      const updated = await resolveAdminReturn(token, id, data);

      // Update in local state
      set((state) => ({
        returns: state.returns.map((r) => (r.id === id ? updated : r)),
        selectedReturn: state.selectedReturn?.id === id ? updated : state.selectedReturn,
      }));

      // Re-fetch list
      await get().fetchReturns(getToken);
    } catch (err: unknown) {
      console.error("[Store] Failed to resolve return", err);
      throw err;
    } finally {
      set({ resolving: false });
    }
  },
}));
