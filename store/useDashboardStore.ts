// src/store/useDashboardStore.ts
import { create } from "zustand";
import { DashboardResponse } from "../schemas/dashboardSchema";
import { fetchDashboardStats } from "../services/dashboardService";

interface DashboardState {
  data: DashboardResponse | null;
  loading: boolean;
  error: string | null;
  fetchDashboard: (getToken: () => Promise<string | null>) => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  data: null,
  loading: false,
  error: null,
  fetchDashboard: async (getToken) => {
    set({ loading: true, error: null });
    try {
      const token = await getToken();
      if (!token) throw new Error("No token provided");
      const stats = await fetchDashboardStats(token);
      set({ data: stats, error: null });
    } catch (err: any) {
      console.error("Failed to fetch dashboard stats", err);
      set({ error: err.message || "Failed to fetch dashboard stats" });
    } finally {
      set({ loading: false });
    }
  },
}));
