import { create } from "zustand";
import { TicketItem } from "../schemas/ticketSchema";
import { getErrorMessage } from "../lib/errors";
import {
  fetchTickets,
  fetchTicketDetail,
  updateTicketStatus,
  createTicketReply,
} from "../services/ticketService";

interface AdminTicketsStore {
  tickets: TicketItem[];
  total: number;
  loading: boolean;
  detailsLoading: boolean;
  selected: TicketItem | null;
  error: string | null;
  statusFilter: string;
  searchQuery: string;
  setStatusFilter: (status: string) => void;
  setSearchQuery: (query: string) => void;
  fetchTickets: (
    getToken: () => Promise<string | null>,
    page?: number,
    limit?: number
  ) => Promise<void>;
  fetchDetail: (getToken: () => Promise<string | null>, id: number | string) => Promise<void>;
  updateStatus: (
    getToken: () => Promise<string | null>,
    id: number | string,
    status: string
  ) => Promise<void>;
  reply: (
    getToken: () => Promise<string | null>,
    id: number | string,
    message: string
  ) => Promise<void>;
  clearSelected: () => void;
}

export const useAdminTicketsStore = create<AdminTicketsStore>((set, get) => ({
  tickets: [],
  total: 0,
  loading: false,
  detailsLoading: false,
  selected: null,
  error: null,
  statusFilter: "all",
  searchQuery: "",

  setStatusFilter: (status) => set({ statusFilter: status }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  fetchTickets: async (getToken, page = 1, limit = 20) => {
    set({ loading: true, error: null });
    try {
      const token = await getToken();
      if (!token) throw new Error("No token");
      const { statusFilter, searchQuery } = get();
      const resp = await fetchTickets(token, page, limit, statusFilter, searchQuery);
      set({ tickets: resp.tickets || [], total: resp.total || 0 });
    } catch (err: unknown) {
      set({
        error: getErrorMessage(err, "Failed to fetch support tickets"),
        tickets: [],
        total: 0,
      });
    } finally {
      set({ loading: false });
    }
  },

  fetchDetail: async (getToken, id) => {
    set({ detailsLoading: true, error: null });
    try {
      const token = await getToken();
      if (!token) throw new Error("No token");
      const detail = await fetchTicketDetail(token, id);
      set({ selected: detail });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err, "Failed to fetch ticket details") });
    } finally {
      set({ detailsLoading: false });
    }
  },

  updateStatus: async (getToken, id, status) => {
    const token = await getToken();
    if (!token) throw new Error("No token");
    const updated = await updateTicketStatus(token, id, { status });
    set((state) => ({
      selected: state.selected?.id === updated.id ? updated : state.selected,
      tickets: state.tickets.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)),
    }));
  },

  reply: async (getToken, id, message) => {
    const token = await getToken();
    if (!token) throw new Error("No token");
    await createTicketReply(token, id, { message });
    const detail = await fetchTicketDetail(token, id);
    set((state) => ({
      selected: detail,
      tickets: state.tickets.map((t) => (t.id === detail.id ? { ...t, ...detail } : t)),
    }));
  },

  clearSelected: () => set({ selected: null }),
}));
