import { create } from "zustand";
import {
  SupportListItem,
  SupportDetailResponse,
  CreateSupportRequest,
} from "../schemas/supportSchema";
import {
  fetchSupportStaff,
  fetchSupportDetail,
  createSupportStaff,
  revokeSupportRole,
} from "../services/supportService";

interface AdminSupportStore {
  support: SupportListItem[];
  total: number;
  loading: boolean;
  detailsLoading: boolean;
  selected: SupportDetailResponse | null;
  error: string | null;
  fetchSupport: (getToken: () => Promise<string | null>) => Promise<void>;
  fetchDetail: (getToken: () => Promise<string | null>, id: string) => Promise<void>;
  createSupport: (
    getToken: () => Promise<string | null>,
    data: CreateSupportRequest
  ) => Promise<void>;
  revokeSupport: (getToken: () => Promise<string | null>, id: string) => Promise<void>;
  clearSelected: () => void;
}

export const useAdminSupportStore = create<AdminSupportStore>((set, get) => ({
  support: [],
  total: 0,
  loading: false,
  detailsLoading: false,
  selected: null,
  error: null,

  fetchSupport: async (getToken) => {
    set({ loading: true, error: null });
    try {
      const token = await getToken();
      if (!token) throw new Error("No token");
      const resp = await fetchSupportStaff(token);
      set({ support: resp.support || [], total: resp.total || 0 });
    } catch (err: any) {
      set({ error: err.message || "Failed to fetch support staff" });
    } finally {
      set({ loading: false });
    }
  },

  fetchDetail: async (getToken, id) => {
    set({ detailsLoading: true, error: null });
    try {
      const token = await getToken();
      if (!token) throw new Error("No token");
      const detail = await fetchSupportDetail(token, id);
      set({ selected: detail });
    } catch (err: any) {
      set({ error: err.message || "Failed to fetch support detail" });
    } finally {
      set({ detailsLoading: false });
    }
  },

  createSupport: async (getToken, data) => {
    const token = await getToken();
    if (!token) throw new Error("No token");
    await createSupportStaff(token, data);
    await get().fetchSupport(getToken);
  },

  revokeSupport: async (getToken, id) => {
    const token = await getToken();
    if (!token) throw new Error("No token");
    await revokeSupportRole(token, id);
    set({ selected: null });
    await get().fetchSupport(getToken);
  },

  clearSelected: () => set({ selected: null }),
}));
