// src/store/useAdminBloodStore.ts
import { create } from "zustand";
import { BloodRequestItem, DonorItem } from "../schemas/bloodSchema";
import {
  fetchBloodRequests,
  updateBloodRequestStatus,
  updateBloodRequest,
  deleteBloodRequest,
  fetchStandingDonors,
  fetchMatchingDonors,
} from "../services/bloodService";
import { ApiError } from "../services/apiService";
import { getErrorMessage } from "../lib/errors";

interface AdminBloodState {
  // Requests
  requests: BloodRequestItem[];
  total: number;
  loading: boolean;
  error: string | null;
  statusFilter: string;

  // Donors Directory
  donors: DonorItem[];
  donorsTotal: number;
  donorsLoading: boolean;
  donorsError: string | null;

  // Matching Donors Modal
  matchingDonors: DonorItem[];
  matchingLoading: boolean;
  matchingError: string | null;
  activeRequestId: string | number | null;

  setStatusFilter: (status: string) => void;

  fetchAdminBloodRequests: (
    getToken?: () => Promise<string | null>,
    page?: number,
    limit?: number,
    status?: string
  ) => Promise<void>;

  updateAdminBloodRequestStatus: (
    getToken: (() => Promise<string | null>) | undefined,
    id: string | number,
    status: string
  ) => Promise<BloodRequestItem>;

  updateAdminBloodRequest: (
    getToken: (() => Promise<string | null>) | undefined,
    id: string | number,
    data: Record<string, unknown>
  ) => Promise<BloodRequestItem>;

  deleteAdminBloodRequest: (
    getToken: (() => Promise<string | null>) | undefined,
    id: string | number
  ) => Promise<void>;

  fetchDonorsDirectory: (
    getToken?: () => Promise<string | null>,
    filters?: { blood_type?: string; city_id?: string | number; only_available?: boolean }
  ) => Promise<void>;

  fetchAutoMatchingDonors: (
    getToken: (() => Promise<string | null>) | undefined,
    requestId: string | number
  ) => Promise<DonorItem[]>;

  clearMatchingDonors: () => void;
}

export const useAdminBloodStore = create<AdminBloodState>((set, get) => ({
  requests: [],
  total: 0,
  loading: false,
  error: null,
  statusFilter: "all",

  donors: [],
  donorsTotal: 0,
  donorsLoading: false,
  donorsError: null,

  matchingDonors: [],
  matchingLoading: false,
  matchingError: null,
  activeRequestId: null,

  setStatusFilter: (status: string) => set({ statusFilter: status }),

  fetchAdminBloodRequests: async (getToken, page = 1, limit = 10, status) => {
    set({ loading: true, error: null });
    try {
      const token = getToken ? await getToken() : undefined;
      const filter = status !== undefined ? status : get().statusFilter;
      const resp = await fetchBloodRequests(token || undefined, page, limit, filter);
      set({ requests: resp.requests || [], total: resp.total || 0, error: null });
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 404) {
        set({ requests: [], total: 0, error: null });
      } else {
        console.error("[Store] Failed to fetch blood requests", err);
        set({ error: getErrorMessage(err, "Failed to fetch blood requests") });
      }
    } finally {
      set({ loading: false });
    }
  },

  updateAdminBloodRequestStatus: async (getToken, id, status) => {
    set({ loading: true, error: null });
    try {
      const token = getToken ? await getToken() : undefined;
      const updated = await updateBloodRequestStatus(token || undefined, id, status);
      set((state) => ({
        requests: state.requests.map((r) => (String(r.id) === String(id) ? { ...r, status } : r)),
        error: null,
      }));
      return updated;
    } catch (err: unknown) {
      console.error("[Store] Failed to update blood request status", err);
      set({ error: getErrorMessage(err, "Failed to update blood request status") });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  updateAdminBloodRequest: async (getToken, id, data) => {
    set({ loading: true, error: null });
    try {
      const token = getToken ? await getToken() : undefined;
      const updated = await updateBloodRequest(token || undefined, id, data);
      set((state) => ({
        requests: state.requests.map((r) => (String(r.id) === String(id) ? { ...r, ...updated } : r)),
        error: null,
      }));
      return updated;
    } catch (err: unknown) {
      console.error("[Store] Failed to update blood request", err);
      set({ error: getErrorMessage(err, "Failed to update blood request") });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  deleteAdminBloodRequest: async (getToken, id) => {
    set({ loading: true, error: null });
    try {
      const token = getToken ? await getToken() : undefined;
      await deleteBloodRequest(token || undefined, id);
      set((state) => ({
        requests: state.requests.filter((r) => String(r.id) !== String(id)),
        error: null,
      }));
    } catch (err: unknown) {
      console.error("[Store] Failed to delete blood request", err);
      set({ error: getErrorMessage(err, "Failed to delete blood request") });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  fetchDonorsDirectory: async (getToken, filters) => {
    set({ donorsLoading: true, donorsError: null });
    try {
      const token = getToken ? await getToken() : undefined;
      const resp = await fetchStandingDonors(token || undefined, filters);
      set({ donors: resp.donors || [], donorsTotal: resp.total || (resp.donors || []).length, donorsError: null });
    } catch (err: unknown) {
      console.error("[Store] Failed to fetch donors directory", err);
      set({ donorsError: getErrorMessage(err, "Failed to fetch donor directory") });
    } finally {
      set({ donorsLoading: false });
    }
  },

  fetchAutoMatchingDonors: async (getToken, requestId) => {
    set({ matchingLoading: true, matchingError: null, activeRequestId: requestId, matchingDonors: [] });
    try {
      const token = getToken ? await getToken() : undefined;
      const resp = await fetchMatchingDonors(token || undefined, requestId);
      const list = resp.donors || [];
      set({ matchingDonors: list, matchingError: null });
      return list;
    } catch (err: unknown) {
      console.error("[Store] Failed to fetch matching donors", err);
      set({ matchingError: getErrorMessage(err, "Failed to fetch matching donors"), matchingDonors: [] });
      return [];
    } finally {
      set({ matchingLoading: false });
    }
  },

  clearMatchingDonors: () => set({ matchingDonors: [], activeRequestId: null, matchingError: null }),
}));
