import { create } from "zustand";
import { DashboardResponse } from "../schemas/dashboardSchema";
import { fetchDashboardStats } from "../services/dashboardService";
import { syncUser } from "../services/userService";
import { ApiError } from "../services/apiService";

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

      const isUserNotFound =
        (err instanceof ApiError && (err.status === 401 || err.status === 404 || err.status === 400)) ||
        (err?.message && String(err.message).toLowerCase().includes("user not found"));

      if (isUserNotFound) {
        try {
          const syncToken = await getToken();
          if (syncToken) {
            await syncUser(syncToken);
            const retryStats = await fetchDashboardStats(syncToken);
            set({ data: retryStats, error: null });
            return;
          }
        } catch (retryErr) {
          console.error("[DashboardStore] Retry after sync failed:", retryErr);
        }
      }

      set({ error: err.message || "Failed to fetch dashboard stats" });
    } finally {
      set({ loading: false });
    }
  },
}));
