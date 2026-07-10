import { create } from "zustand";
import { BloodRequestItem } from "../schemas/bloodSchema";
import { fetchBloodRequests, updateBloodRequestStatus } from "../services/bloodService";

interface AdminBloodState {
  requests: BloodRequestItem[];
  total: number;
  loading: boolean;
  error: string | null;

  fetchAdminBloodRequests: (
    getToken: () => Promise<string | null>,
    page?: number,
    limit?: number
  ) => Promise<void>;

  updateAdminBloodRequestStatus: (
    getToken: () => Promise<string | null>,
    id: string | number,
    status: string
  ) => Promise<BloodRequestItem>;
}

export const useAdminBloodStore = create<AdminBloodState>((set, get) => ({
  requests: [],
  total: 0,
  loading: false,
  error: null,

  fetchAdminBloodRequests: async (getToken, page = 1, limit = 10) => {
    set({ loading: true, error: null });
    try {
      const token = await getToken();
      if (!token) throw new Error("No token provided");
      console.log(`[Store] Fetching blood requests page ${page}`);
      const resp = await fetchBloodRequests(token, page, limit);
      set({ requests: resp.requests || [], total: resp.total || 0, error: null });
    } catch (err: any) {
      console.error("[Store] Failed to fetch blood requests", err);
      set({ error: err.message || "Failed to fetch blood requests" });
    } finally {
      set({ loading: false });
    }
  },

  updateAdminBloodRequestStatus: async (getToken, id, status) => {
    set({ loading: true, error: null });
    try {
      const token = await getToken();
      if (!token) throw new Error("No token provided");
      console.log(`[Store] Updating blood request ${id} to ${status}`);
      const updated = await updateBloodRequestStatus(token, id, status);
      set((state) => ({
        requests: state.requests.map((r) => (r.id === updated.id ? updated : r)),
        error: null,
      }));
      return updated;
    } catch (err: any) {
      console.error("[Store] Failed to update blood request status", err);
      set({ error: err.message || "Failed to update blood request status" });
      throw err;
    } finally {
      set({ loading: false });
    }
  },
}));
