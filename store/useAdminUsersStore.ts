// src/store/useAdminUsersStore.ts
import { create } from "zustand";
import { UserListItem, UserDetailsResponse, UpdateUserRequest } from "../schemas/userSchema";
import { 
  fetchUsers, 
  suspendUser, 
  verifyUser, 
  getUser, 
  updateUser, 
  updateUserRole 
} from "../services/userService";

interface AdminUsersState {
  users: UserListItem[];
  selectedUser: UserDetailsResponse | null;
  loading: boolean;
  detailsLoading: boolean;
  error: string | null;
  activeRole: string; // July 2026: role filter
  
  fetchAdminUsers: (getToken: () => Promise<string | null>, role?: string) => Promise<void>;
  suspendAdminUser: (getToken: () => Promise<string | null>, id: string, suspend: boolean) => Promise<void>;
  verifyAdminUser: (getToken: () => Promise<string | null>, id: string) => Promise<void>;
  
  fetchUserDetail: (getToken: () => Promise<string | null>, id: string) => Promise<void>;
  updateUserDetails: (getToken: () => Promise<string | null>, id: string, data: UpdateUserRequest) => Promise<void>;
  updateUserRoleAction: (getToken: () => Promise<string | null>, id: string, role: string) => Promise<void>;
  clearSelectedUser: () => void;
  setActiveRole: (role: string) => void;
}

export const useAdminUsersStore = create<AdminUsersState>((set, get) => ({
  users: [],
  selectedUser: null,
  loading: false,
  detailsLoading: false,
  error: null,
  activeRole: "",
  
  fetchAdminUsers: async (getToken, role) => {
    set({ loading: true, error: null, activeRole: role || "" });
    try {
      const token = await getToken();
      if (!token) throw new Error("No token provided");
      const resp = await fetchUsers(token, 1, 50, role || undefined);
      set({ users: resp.users || [], error: null });
    } catch (err: any) {
      console.error("[Store] Failed to fetch users", err);
      set({ error: err.message || "Failed to fetch users" });
    } finally {
      set({ loading: false });
    }
  },
  
  suspendAdminUser: async (getToken, id, suspend) => {
    try {
      const token = await getToken();
      if (!token) return;
      console.log(`[Store] Suspending user ${id} (status: ${suspend})`);
      await suspendUser(token, id, suspend);
      await get().fetchAdminUsers(getToken);
    } catch (err: any) {
      console.error("[Store] Failed to suspend user", err);
    }
  },
  
  verifyAdminUser: async (getToken, id) => {
    try {
      const token = await getToken();
      if (!token) return;
      console.log(`[Store] Verifying user ${id}`);
      await verifyUser(token, id);
      await get().fetchAdminUsers(getToken);
    } catch (err: any) {
      console.error("[Store] Failed to verify user", err);
    }
  },

  fetchUserDetail: async (getToken, id) => {
    set({ detailsLoading: true, error: null });
    try {
      const token = await getToken();
      if (!token) return;
      console.log(`[Store] Fetching details for user ${id}`);
      const details = await getUser(token, id);
      set({ selectedUser: details, error: null });
    } catch (err: any) {
      console.error("[Store] Failed to fetch user details", err);
      set({ error: err.message || "Failed to fetch user details" });
    } finally {
      set({ detailsLoading: false });
    }
  },

  updateUserDetails: async (getToken, id, data) => {
    try {
      const token = await getToken();
      if (!token) return;
      console.log(`[Store] Updating user details for ${id}`, data);
      await updateUser(token, id, data);
      await get().fetchUserDetail(getToken, id); // Refresh details
      await get().fetchAdminUsers(getToken); // Refresh list
    } catch (err: any) {
      console.error("[Store] Failed to update user details", err);
      throw err;
    }
  },

  updateUserRoleAction: async (getToken, id, role) => {
    try {
      const token = await getToken();
      if (!token) return;
      console.log(`[Store] Updating role for ${id} to ${role}`);
      await updateUserRole(token, id, role);
      await get().fetchUserDetail(getToken, id); // Refresh details
      await get().fetchAdminUsers(getToken); // Refresh list
    } catch (err: any) {
      console.error("[Store] Failed to update user role", err);
      throw err;
    }
  },

  clearSelectedUser: () => set({ selectedUser: null }),
  setActiveRole: (role: string) => set({ activeRole: role }),
}));
