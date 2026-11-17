import { create } from "zustand";
import { getErrorMessage } from "../lib/errors";
import {
  SubscriptionPlan,
  SubscriptionHistoryItem,
  ReconciliationItem,
  CreateSubscriptionPlanRequest,
  UpdateSubscriptionPlanRequest,
} from "../schemas/subscriptionSchema";
import {
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  fetchSubscriptionHistory,
  fetchSubscriptionPlans,
  fetchSubscriptionReconciliations,
  resolveSubscriptionReconciliation,
} from "../services/subscriptionService";

interface AdminSubscriptionsState {
  plans: SubscriptionPlan[];
  history: SubscriptionHistoryItem[];
  historyTotal: number;
  reconciliations: ReconciliationItem[];
  reconciliationsTotal: number;
  loading: boolean;
  error: string | null;

  fetchPlans: (getToken: () => Promise<string | null>) => Promise<void>;
  fetchHistory: (getToken: () => Promise<string | null>, page?: number, limit?: number) => Promise<void>;
  fetchReconciliations: (getToken: () => Promise<string | null>, page?: number, limit?: number) => Promise<void>;

  createPlan: (
    getToken: () => Promise<string | null>,
    data: CreateSubscriptionPlanRequest
  ) => Promise<SubscriptionPlan>;

  updatePlan: (
    getToken: () => Promise<string | null>,
    id: string | number,
    data: UpdateSubscriptionPlanRequest
  ) => Promise<SubscriptionPlan>;

  deletePlan: (
    getToken: () => Promise<string | null>,
    id: string | number
  ) => Promise<void>;

  resolveReconciliation: (
    getToken: () => Promise<string | null>,
    id: number,
    planId: number
  ) => Promise<void>;
}

export const useAdminSubscriptionsStore = create<AdminSubscriptionsState>((set, get) => ({
  plans: [],
  history: [],
  historyTotal: 0,
  reconciliations: [],
  reconciliationsTotal: 0,
  loading: false,
  error: null,

  fetchPlans: async (getToken) => {
    set({ loading: true, error: null });
    try {
      const token = await getToken();
      if (!token) throw new Error("No token provided");
      const plans = await fetchSubscriptionPlans(token);
      set({ plans, error: null });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err, "Failed to fetch subscription plans") });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  fetchHistory: async (getToken, page = 1, limit = 10) => {
    set({ loading: true, error: null });
    try {
      const token = await getToken();
      if (!token) throw new Error("No token provided");
      const resp = await fetchSubscriptionHistory(token, page, limit);
      set({
        history: resp.subscriptions || [],
        historyTotal: resp.total || 0,
        error: null,
      });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err, "Failed to fetch subscription history") });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  fetchReconciliations: async (getToken, page = 1, limit = 20) => {
    set({ loading: true, error: null });
    try {
      const token = await getToken();
      if (!token) throw new Error("No token provided");
      const resp = await fetchSubscriptionReconciliations(token, page, limit);
      set({
        reconciliations: resp.items || [],
        reconciliationsTotal: resp.total || 0,
        error: null,
      });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err, "Failed to fetch reconciliations") });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  createPlan: async (getToken, data) => {
    set({ loading: true, error: null });
    try {
      const token = await getToken();
      if (!token) throw new Error("No token provided");
      const newPlan = await createSubscriptionPlan(token, data);
      set((state) => ({
        plans: [...state.plans, newPlan],
        error: null,
      }));
      return newPlan;
    } catch (err: unknown) {
      set({ error: getErrorMessage(err, "Failed to create plan") });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  updatePlan: async (getToken, id, data) => {
    set({ loading: true, error: null });
    try {
      const token = await getToken();
      if (!token) throw new Error("No token provided");
      const updatedPlan = await updateSubscriptionPlan(token, id, data);
      set((state) => ({
        plans: state.plans.map((p) => (p.id === updatedPlan.id ? updatedPlan : p)),
        error: null,
      }));
      return updatedPlan;
    } catch (err: unknown) {
      set({ error: getErrorMessage(err, "Failed to update plan") });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  deletePlan: async (getToken, id) => {
    set({ loading: true, error: null });
    try {
      const token = await getToken();
      if (!token) throw new Error("No token provided");
      await deleteSubscriptionPlan(token, id);
      const numericId = typeof id === "string" ? parseInt(id, 10) : id;
      set((state) => ({
        plans: state.plans.filter((p) => p.id !== numericId),
        error: null,
      }));
    } catch (err: unknown) {
      set({ error: getErrorMessage(err, "Failed to delete plan") });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  resolveReconciliation: async (getToken, id, planId) => {
    try {
      const token = await getToken();
      if (!token) throw new Error("No token provided");
      await resolveSubscriptionReconciliation(token, id, planId);
      await get().fetchReconciliations(getToken);
    } catch (err: unknown) {
      set({ error: getErrorMessage(err, "Failed to resolve reconciliation") });
      throw err;
    }
  },
}));
