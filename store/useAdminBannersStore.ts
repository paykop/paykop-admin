import { create } from "zustand";
import { BannerItem, CreateBannerRequest, UpdateBannerRequest } from "../schemas/bannerSchema";
import {
  fetchAdminBanners,
  createAdminBanner,
  updateAdminBanner,
  deleteAdminBanner,
} from "../services/bannerService";

interface AdminBannersStore {
  banners: BannerItem[];
  loading: boolean;
  error: string | null;
  fetchBanners: (getToken: () => Promise<string | null>) => Promise<void>;
  createBanner: (getToken: () => Promise<string | null>, data: CreateBannerRequest) => Promise<void>;
  updateBanner: (
    getToken: () => Promise<string | null>,
    id: number,
    data: UpdateBannerRequest
  ) => Promise<void>;
  deleteBanner: (getToken: () => Promise<string | null>, id: number) => Promise<void>;
}

export const useAdminBannersStore = create<AdminBannersStore>((set, get) => ({
  banners: [],
  loading: false,
  error: null,

  fetchBanners: async (getToken) => {
    set({ loading: true, error: null });
    try {
      const token = await getToken();
      if (!token) throw new Error("No token");
      const resp = await fetchAdminBanners(token);
      set({ banners: resp.banners || [] });
    } catch (err: any) {
      // Backend may return a bare array; apiRequest/schema handles object — soft-fail empty
      set({ error: err.message || "Failed to fetch banners", banners: [] });
    } finally {
      set({ loading: false });
    }
  },

  createBanner: async (getToken, data) => {
    const token = await getToken();
    if (!token) throw new Error("No token");
    await createAdminBanner(token, data);
    await get().fetchBanners(getToken);
  },

  updateBanner: async (getToken, id, data) => {
    const token = await getToken();
    if (!token) throw new Error("No token");
    await updateAdminBanner(token, id, data);
    await get().fetchBanners(getToken);
  },

  deleteBanner: async (getToken, id) => {
    const token = await getToken();
    if (!token) throw new Error("No token");
    await deleteAdminBanner(token, id);
    await get().fetchBanners(getToken);
  },
}));
