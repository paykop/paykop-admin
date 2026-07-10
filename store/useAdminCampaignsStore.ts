import { create } from "zustand";
import { CampaignItem, CreateCampaignRequest, UpdateCampaignRequest } from "../schemas/campaignSchema";
import { fetchCampaigns, createCampaign, updateCampaign, deleteCampaign } from "../services/campaignService";

interface AdminCampaignsState {
  campaigns: CampaignItem[];
  total: number;
  loading: boolean;
  error: string | null;

  fetchAdminCampaigns: (
    getToken: () => Promise<string | null>,
    page?: number,
    limit?: number
  ) => Promise<void>;

  createAdminCampaign: (
    getToken: () => Promise<string | null>,
    data: CreateCampaignRequest
  ) => Promise<CampaignItem>;

  updateAdminCampaign: (
    getToken: () => Promise<string | null>,
    id: string | number,
    data: UpdateCampaignRequest
  ) => Promise<CampaignItem>;

  deleteAdminCampaign: (
    getToken: () => Promise<string | null>,
    id: string | number
  ) => Promise<void>;
}

export const useAdminCampaignsStore = create<AdminCampaignsState>((set, get) => ({
  campaigns: [],
  total: 0,
  loading: false,
  error: null,

  fetchAdminCampaigns: async (getToken, page = 1, limit = 10) => {
    set({ loading: true, error: null });
    try {
      const token = await getToken();
      if (!token) throw new Error("No token provided");
      console.log(`[Store] Fetching campaigns page ${page}`);
      const resp = await fetchCampaigns(token, page, limit);
      set({ campaigns: resp.campaigns || [], total: resp.total || 0, error: null });
    } catch (err: any) {
      console.error("[Store] Failed to fetch campaigns", err);
      set({ error: err.message || "Failed to fetch campaigns" });
    } finally {
      set({ loading: false });
    }
  },

  createAdminCampaign: async (getToken, data) => {
    set({ loading: true, error: null });
    try {
      const token = await getToken();
      if (!token) throw new Error("No token provided");
      const campaign = await createCampaign(token, data);
      set((state) => ({
        campaigns: [campaign, ...state.campaigns],
        total: state.total + 1,
        error: null,
      }));
      return campaign;
    } catch (err: any) {
      console.error("[Store] Failed to create campaign", err);
      set({ error: err.message || "Failed to create campaign" });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  updateAdminCampaign: async (getToken, id, data) => {
    set({ loading: true, error: null });
    try {
      const token = await getToken();
      if (!token) throw new Error("No token provided");
      const campaign = await updateCampaign(token, id, data);
      set((state) => ({
        campaigns: state.campaigns.map((c) => (c.id === campaign.id ? campaign : c)),
        error: null,
      }));
      return campaign;
    } catch (err: any) {
      console.error("[Store] Failed to update campaign", err);
      set({ error: err.message || "Failed to update campaign" });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  deleteAdminCampaign: async (getToken, id) => {
    set({ loading: true, error: null });
    try {
      const token = await getToken();
      if (!token) throw new Error("No token provided");
      await deleteCampaign(token, id);
      const numericId = typeof id === "string" ? parseInt(id, 10) : id;
      set((state) => ({
        campaigns: state.campaigns.filter((c) => c.id !== numericId),
        total: Math.max(0, state.total - 1),
        error: null,
      }));
    } catch (err: any) {
      console.error("[Store] Failed to delete campaign", err);
      set({ error: err.message || "Failed to delete campaign" });
      throw err;
    } finally {
      set({ loading: false });
    }
  },
}));
