import { create } from "zustand";
import { getErrorMessage } from "../lib/errors";
import {
  AgentListItem,
  AgentDetailResponse,
  AgentAssignmentSummary,
  CreateAgentRequest,
  CreateAssignmentRequest,
} from "../schemas/agentSchema";
import {
  fetchAgents,
  getAgent,
  listAgentAssignments,
  createAgent,
  revokeAgentRole,
  assignSellerToAgent,
  revokeAssignment,
} from "../services/agentService";

interface AdminAgentsState {
  agents: AgentListItem[];
  selectedAgent: AgentDetailResponse | null;
  assignments: AgentAssignmentSummary[];
  loading: boolean;
  detailsLoading: boolean;
  error: string | null;

  fetchAdminAgents: (getToken: () => Promise<string | null>) => Promise<void>;
  fetchAgentDetail: (getToken: () => Promise<string | null>, id: string) => Promise<void>;
  fetchAgentAssignments: (getToken: () => Promise<string | null>, id: string) => Promise<void>;
  createAdminAgent: (getToken: () => Promise<string | null>, data: CreateAgentRequest) => Promise<void>;
  demoteAgent: (getToken: () => Promise<string | null>, id: string) => Promise<void>;
  assignSeller: (getToken: () => Promise<string | null>, data: CreateAssignmentRequest) => Promise<void>;
  revokeSellerAssignment: (
    getToken: () => Promise<string | null>,
    assignmentId: number,
    agentId: string
  ) => Promise<void>;
  clearSelectedAgent: () => void;
}

export const useAdminAgentsStore = create<AdminAgentsState>((set, get) => ({
  agents: [],
  selectedAgent: null,
  assignments: [],
  loading: false,
  detailsLoading: false,
  error: null,

  fetchAdminAgents: async (getToken) => {
    set({ loading: true, error: null });
    try {
      const token = await getToken();
      if (!token) throw new Error("No token provided");
      const resp = await fetchAgents(token, 1, 50);
      set({ agents: resp.agents || [], error: null });
    } catch (err: unknown) {
      console.error("[Store] Failed to fetch agents", err);
      set({ error: getErrorMessage(err, "Failed to fetch agents") });
    } finally {
      set({ loading: false });
    }
  },

  fetchAgentDetail: async (getToken, id) => {
    set({ detailsLoading: true, error: null });
    try {
      const token = await getToken();
      if (!token) return;
      const details = await getAgent(token, id);
      set({
        selectedAgent: details,
        assignments: details.assignments || [],
        error: null,
      });
    } catch (err: unknown) {
      console.error("[Store] Failed to fetch agent details", err);
      set({ error: getErrorMessage(err, "Failed to fetch agent details") });
    } finally {
      set({ detailsLoading: false });
    }
  },

  fetchAgentAssignments: async (getToken, id) => {
    try {
      const token = await getToken();
      if (!token) return;
      const resp = await listAgentAssignments(token, id);
      set({ assignments: resp.assignments || [], error: null });
    } catch (err: unknown) {
      console.error("[Store] Failed to fetch agent assignments", err);
      set({ error: getErrorMessage(err, "Failed to fetch assignments") });
    }
  },

  createAdminAgent: async (getToken, data) => {
    const token = await getToken();
    if (!token) throw new Error("No token provided");
    await createAgent(token, data);
    await get().fetchAdminAgents(getToken);
  },

  demoteAgent: async (getToken, id) => {
    const token = await getToken();
    if (!token) throw new Error("No token provided");
    await revokeAgentRole(token, id);
    set({ selectedAgent: null, assignments: [] });
    await get().fetchAdminAgents(getToken);
  },

  assignSeller: async (getToken, data) => {
    const token = await getToken();
    if (!token) throw new Error("No token provided");
    await assignSellerToAgent(token, data);
    await get().fetchAgentDetail(getToken, data.agent_id);
    await get().fetchAdminAgents(getToken);
  },

  revokeSellerAssignment: async (getToken, assignmentId, agentId) => {
    const token = await getToken();
    if (!token) throw new Error("No token provided");
    await revokeAssignment(token, assignmentId);
    await get().fetchAgentDetail(getToken, agentId);
    await get().fetchAdminAgents(getToken);
  },

  clearSelectedAgent: () => set({ selectedAgent: null, assignments: [] }),
}));
