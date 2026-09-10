import { create } from "zustand";
import { Organization, CreateOrgRequest } from "../schemas/organizationSchema";
import { getErrorMessage } from "../lib/errors";
import {
  fetchOrganizations,
  fetchOrganization,
  createOrganization,
  updateOrganizationKYC,
} from "../services/organizationService";

interface AdminOrgStore {
  organizations: Organization[];
  total: number;
  loading: boolean;
  detailsLoading: boolean;
  selected: Organization | null;
  error: string | null;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  fetchOrganizations: (
    getToken: () => Promise<string | null>,
    page?: number,
    limit?: number,
    status?: string
  ) => Promise<void>;
  fetchDetail: (getToken: () => Promise<string | null>, id: string) => Promise<void>;
  createOrg: (
    getToken: () => Promise<string | null>,
    payload: CreateOrgRequest
  ) => Promise<Organization>;
  approveKYC: (getToken: () => Promise<string | null>, id: string) => Promise<void>;
  rejectKYC: (
    getToken: () => Promise<string | null>,
    id: string,
    reason: string
  ) => Promise<void>;
  clearSelected: () => void;
}

export const useAdminOrgStore = create<AdminOrgStore>((set, get) => ({
  organizations: [],
  total: 0,
  loading: false,
  detailsLoading: false,
  selected: null,
  error: null,
  statusFilter: "all",

  setStatusFilter: (status) => set({ statusFilter: status }),

  fetchOrganizations: async (getToken, page = 1, limit = 20, status) => {
    set({ loading: true, error: null });
    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication required");
      const filter = status !== undefined ? status : get().statusFilter;
      const resp = await fetchOrganizations(token, page, limit, filter);
      set({ organizations: resp.organizations || [], total: resp.total || 0 });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err, "Failed to fetch organizations"), organizations: [] });
    } finally {
      set({ loading: false });
    }
  },

  fetchDetail: async (getToken, id) => {
    set({ detailsLoading: true, error: null });
    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication required");
      const detail = await fetchOrganization(token, id);
      set({ selected: detail });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err, "Failed to fetch organization details") });
    } finally {
      set({ detailsLoading: false });
    }
  },

  createOrg: async (getToken, payload) => {
    const token = await getToken();
    if (!token) throw new Error("Authentication required");
    const created = await createOrganization(token, payload);
    set((state) => ({
      organizations: [created, ...state.organizations],
      total: state.total + 1,
    }));
    return created;
  },

  approveKYC: async (getToken, id) => {
    const token = await getToken();
    if (!token) throw new Error("Authentication required");
    const updated = await updateOrganizationKYC(token, id, "verified");
    set((state) => ({
      organizations: state.organizations.map((org) =>
        org.id === id ? { ...org, kyc_status: "verified", verified_at: updated.verified_at, verified_by: updated.verified_by } : org
      ),
      selected: state.selected?.id === id ? updated : state.selected,
    }));
  },

  rejectKYC: async (getToken, id, reason) => {
    const token = await getToken();
    if (!token) throw new Error("Authentication required");
    const updated = await updateOrganizationKYC(token, id, "rejected", reason);
    set((state) => ({
      organizations: state.organizations.map((org) =>
        org.id === id ? { ...org, kyc_status: "rejected", rejection_reason: reason } : org
      ),
      selected: state.selected?.id === id ? updated : state.selected,
    }));
  },

  clearSelected: () => set({ selected: null }),
}));
