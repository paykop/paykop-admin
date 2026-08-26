import { create } from "zustand";
import { KycSubmission } from "../schemas/kycSchema";
import { getErrorMessage } from "../lib/errors";
import {
  fetchKycSubmissions,
  fetchKycSubmission,
  approveKycSubmission,
  rejectKycSubmission,
} from "../services/kycService";

interface AdminKycStore {
  submissions: KycSubmission[];
  total: number;
  loading: boolean;
  detailsLoading: boolean;
  selected: KycSubmission | null;
  error: string | null;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  fetchSubmissions: (
    getToken: () => Promise<string | null>,
    page?: number,
    limit?: number,
    status?: string
  ) => Promise<void>;
  fetchDetail: (getToken: () => Promise<string | null>, id: number | string) => Promise<void>;
  approve: (getToken: () => Promise<string | null>, id: number | string) => Promise<void>;
  reject: (
    getToken: () => Promise<string | null>,
    id: number | string,
    reason: string
  ) => Promise<void>;
  clearSelected: () => void;
}

export const useAdminKycStore = create<AdminKycStore>((set, get) => ({
  submissions: [],
  total: 0,
  loading: false,
  detailsLoading: false,
  selected: null,
  error: null,
  statusFilter: "pending",

  setStatusFilter: (status) => set({ statusFilter: status }),

  fetchSubmissions: async (getToken, page = 1, limit = 20, status) => {
    set({ loading: true, error: null });
    try {
      const token = await getToken();
      if (!token) throw new Error("No token");
      const filter = status !== undefined ? status : get().statusFilter;
      const resp = await fetchKycSubmissions(token, page, limit, filter);
      set({ submissions: resp.submissions || [], total: resp.total || 0 });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err, "Failed to fetch KYC submissions"), submissions: [] });
    } finally {
      set({ loading: false });
    }
  },

  fetchDetail: async (getToken, id) => {
    set({ detailsLoading: true, error: null });
    try {
      const token = await getToken();
      if (!token) throw new Error("No token");
      const detail = await fetchKycSubmission(token, id);
      set({ selected: detail });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err, "Failed to fetch KYC detail") });
    } finally {
      set({ detailsLoading: false });
    }
  },

  approve: async (getToken, id) => {
    const token = await getToken();
    if (!token) throw new Error("No token");
    const updated = await approveKycSubmission(token, id);
    set((state) => ({
      selected: updated,
      submissions: state.submissions.map((s) => (s.id === updated.id ? updated : s)),
    }));
    await get().fetchSubmissions(getToken);
  },

  reject: async (getToken, id, reason) => {
    const token = await getToken();
    if (!token) throw new Error("No token");
    const updated = await rejectKycSubmission(token, id, reason);
    set((state) => ({
      selected: updated,
      submissions: state.submissions.map((s) => (s.id === updated.id ? updated : s)),
    }));
    await get().fetchSubmissions(getToken);
  },

  clearSelected: () => set({ selected: null }),
}));
