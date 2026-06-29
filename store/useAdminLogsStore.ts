// src/store/useAdminLogsStore.ts
import { create } from "zustand";
import { AuditLogListItem } from "../schemas/logSchema";
import { fetchAdminLogs } from "../services/logService";

interface AdminLogsState {
  logs: AuditLogListItem[];
  total: number;
  loading: boolean;
  error: string | null;
  fetchLogs: (getToken: () => Promise<string | null>, page?: number, limit?: number) => Promise<void>;
}

export const useAdminLogsStore = create<AdminLogsState>((set) => ({
  logs: [],
  total: 0,
  loading: false,
  error: null,
  fetchLogs: async (getToken, page = 1, limit = 50) => {
    set({ loading: true, error: null });
    try {
      const token = await getToken();
      if (!token) throw new Error("No token provided");
      console.log(`[Store] Fetching logs page ${page}`);
      const resp = await fetchAdminLogs(token, page, limit);
      set({ logs: resp.logs || [], total: resp.total || 0, error: null });
    } catch (err: any) {
      console.error("[Store] Failed to fetch logs", err);
      set({ error: err.message || "Failed to fetch logs" });
    } finally {
      set({ loading: false });
    }
  },
}));
