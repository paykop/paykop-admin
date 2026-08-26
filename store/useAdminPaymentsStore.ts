import { create } from "zustand";
import { PaymentItem, TransactionItem } from "../schemas/paymentSchema";
import { fetchPayments, processRefund, fetchTransactionReport } from "../services/paymentService";
import { getErrorMessage } from "../lib/errors";

interface AdminPaymentsState {
  payments: PaymentItem[];
  total: number;
  loading: boolean;
  error: string | null;

  // Transaction reports state
  transactions: TransactionItem[];
  totalAmount: number;
  reportCount: number;
  reportLoading: boolean;

  fetchAdminPayments: (
    getToken: () => Promise<string | null>,
    page?: number,
    limit?: number,
    status?: string,
    startDate?: string,
    endDate?: string
  ) => Promise<void>;

  processPaymentRefund: (
    getToken: () => Promise<string | null>,
    id: string | number
  ) => Promise<void>;

  fetchAdminTransactionReport: (
    getToken: () => Promise<string | null>,
    startDate?: string,
    endDate?: string
  ) => Promise<void>;
}

export const useAdminPaymentsStore = create<AdminPaymentsState>((set, get) => ({
  payments: [],
  total: 0,
  loading: false,
  error: null,

  transactions: [],
  totalAmount: 0,
  reportCount: 0,
  reportLoading: false,

  fetchAdminPayments: async (getToken, page = 1, limit = 10, status, startDate, endDate) => {
    set({ loading: true, error: null });
    try {
      const token = await getToken();
      if (!token) throw new Error("No token provided");
      console.log(`[Store] Fetching payments page ${page}`);
      const resp = await fetchPayments(token, page, limit, status, startDate, endDate);
      set({ payments: resp.payments || [], total: resp.total || 0, error: null });
    } catch (err: unknown) {
      console.error("[Store] Failed to fetch payments", err);
      set({ error: getErrorMessage(err, "Failed to fetch payments") });
    } finally {
      set({ loading: false });
    }
  },

  processPaymentRefund: async (getToken, id) => {
    set({ loading: true, error: null });
    try {
      const token = await getToken();
      if (!token) throw new Error("No token provided");
      console.log(`[Store] Initiating refund for payment: ${id}`);
      await processRefund(token, id);
      // Re-fetch current payment list to sync state
      await get().fetchAdminPayments(getToken);
    } catch (err: unknown) {
      console.error("[Store] Failed to process refund", err);
      set({ error: getErrorMessage(err, "Failed to process refund") });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  fetchAdminTransactionReport: async (getToken, startDate, endDate) => {
    set({ reportLoading: true, error: null });
    try {
      const token = await getToken();
      if (!token) throw new Error("No token provided");
      console.log(`[Store] Fetching transaction report`);
      const resp = await fetchTransactionReport(token, startDate, endDate);
      set({
        transactions: resp.transactions || [],
        totalAmount: resp.total_amount || 0,
        reportCount: resp.count || 0,
        error: null,
      });
    } catch (err: unknown) {
      console.error("[Store] Failed to fetch transaction report", err);
      set({ error: getErrorMessage(err, "Failed to fetch transaction report") });
    } finally {
      set({ reportLoading: false });
    }
  },
}));
