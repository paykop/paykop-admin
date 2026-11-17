import { create } from "zustand";
import {
  CommerceSettings,
  UpdateCommerceSettings,
  CommissionBatchItem,
  CommissionBatchDetailResponse,
  SellerCommissionOverrideRequest,
  SellerCommissionOverride,
} from "../schemas/commerceSchema";
import {
  fetchCommerceSettings,
  updateCommerceSettings,
  fetchCommissionBatches,
  fetchCommissionBatchDetail,
  markCommissionBatchPaid,
  setSellerCommissionOverride,
} from "../services/commerceService";
import { getErrorMessage } from "../lib/errors";

interface AdminCommerceState {
  settings: CommerceSettings | null;
  settingsLoading: boolean;
  settingsError: string | null;

  batches: CommissionBatchItem[];
  batchesTotal: number;
  batchesLoading: boolean;
  batchesError: string | null;

  selectedBatch: CommissionBatchDetailResponse | null;
  detailLoading: boolean;

  fetchSettings: (getToken: () => Promise<string | null>) => Promise<void>;
  saveSettings: (
    getToken: () => Promise<string | null>,
    data: UpdateCommerceSettings
  ) => Promise<void>;
  fetchBatches: (
    getToken: () => Promise<string | null>,
    page?: number,
    limit?: number,
    sellerId?: string
  ) => Promise<void>;
  fetchBatchDetail: (getToken: () => Promise<string | null>, id: number) => Promise<void>;
  markBatchPaid: (getToken: () => Promise<string | null>, id: number) => Promise<void>;
  setSellerOverride: (
    getToken: () => Promise<string | null>,
    sellerId: string,
    data: SellerCommissionOverrideRequest
  ) => Promise<SellerCommissionOverride>;
  clearSelectedBatch: () => void;
}


export const useAdminCommerceStore = create<AdminCommerceState>((set, get) => ({
  settings: null,
  settingsLoading: false,
  settingsError: null,

  batches: [],
  batchesTotal: 0,
  batchesLoading: false,
  batchesError: null,

  selectedBatch: null,
  detailLoading: false,

  fetchSettings: async (getToken) => {
    set({ settingsLoading: true, settingsError: null });
    try {
      const token = await getToken();
      if (!token) throw new Error("No token provided");
      const settings = await fetchCommerceSettings(token);
      set({ settings, settingsError: null });
    } catch (err: unknown) {
      set({ settingsError: getErrorMessage(err, "Failed to load commerce settings") });
    } finally {
      set({ settingsLoading: false });
    }
  },

  saveSettings: async (getToken, data) => {
    set({ settingsLoading: true, settingsError: null });
    try {
      const token = await getToken();
      if (!token) throw new Error("No token provided");
      const settings = await updateCommerceSettings(token, data);
      set({ settings, settingsError: null });
    } catch (err: unknown) {
      set({ settingsError: getErrorMessage(err, "Failed to save commerce settings") });
      throw err;
    } finally {
      set({ settingsLoading: false });
    }
  },

  fetchBatches: async (getToken, page = 1, limit = 20, sellerId) => {
    set({ batchesLoading: true, batchesError: null });
    try {
      const token = await getToken();
      if (!token) throw new Error("No token provided");
      const resp = await fetchCommissionBatches(token, page, limit, sellerId);
      set({ batches: resp.batches || [], batchesTotal: resp.total || 0, batchesError: null });
    } catch (err: unknown) {
      set({ batchesError: getErrorMessage(err, "Failed to fetch commission batches") });
    } finally {
      set({ batchesLoading: false });
    }
  },

  fetchBatchDetail: async (getToken, id) => {
    set({ detailLoading: true });
    try {
      const token = await getToken();
      if (!token) throw new Error("No token provided");
      const selectedBatch = await fetchCommissionBatchDetail(token, id);
      set({ selectedBatch });
    } catch (err: unknown) {
      set({ batchesError: getErrorMessage(err, "Failed to load batch detail") });
      throw err;
    } finally {
      set({ detailLoading: false });
    }
  },

  markBatchPaid: async (getToken, id) => {
    const token = await getToken();
    if (!token) throw new Error("No token provided");
    await markCommissionBatchPaid(token, id);
    await get().fetchBatches(getToken);
    if (get().selectedBatch?.batch.id === id) {
      await get().fetchBatchDetail(getToken, id);
    }
  },

  setSellerOverride: async (getToken, sellerId, data) => {
    const token = await getToken();
    if (!token) throw new Error("No token provided");
    return setSellerCommissionOverride(token, sellerId, data);
  },

  clearSelectedBatch: () => set({ selectedBatch: null }),
}));

