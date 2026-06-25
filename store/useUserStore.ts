// src/store/useUserStore.ts
import { create } from "zustand";
import { BackendUser, PermissionsResponse } from "../schemas/userSchema";
import {
  fetchUserProfile,
  fetchUserPermissions,
} from "../services/userService";

interface UserState {
  backendUser: BackendUser | null;
  permissions: PermissionsResponse | null;
  loading: boolean;
  permissionsLoading: boolean;
  error: string | null;
  setBackendUser: (backendUser: BackendUser | null) => void;
  fetchProfile: (getToken: () => Promise<string | null>) => Promise<void>;
  fetchPermissions: (getToken: () => Promise<string | null>) => Promise<void>;
  clearBackendUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  backendUser: null,
  permissions: null,
  loading: false,
  permissionsLoading: false,
  error: null,
  setBackendUser: (backendUser) => set({ backendUser }),
  
  fetchProfile: async (getToken) => {
    set({ loading: true, error: null });
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("No authentication token found. Please sign in again.");
      }

      // Query database directly to check if the user exists
      const response = await fetchUserProfile(token);
      set({ backendUser: response, error: null });

      // Fetch permissions in background
      try {
        const perms = await fetchUserPermissions(token);
        set({ permissions: perms });
      } catch (permsErr) {
        console.error("Failed to fetch user permissions in background:", permsErr);
      }
    } catch (err: any) {
      console.error("Failed to fetch backend profile:", err);
      // If error status is 401, it means the user record is not found in the DB (RequireAuth failed)
      const errorMsg = err?.status === 401 
        ? "Access Denied: This administrator account does not exist in the database."
        : err?.message || "Could not connect to Go backend.";
      set({ backendUser: null, permissions: null, error: errorMsg });
    } finally {
      set({ loading: false });
    }
  },

  fetchPermissions: async (getToken) => {
    set({ permissionsLoading: true });
    try {
      const token = await getToken();
      if (!token) return;
      const response = await fetchUserPermissions(token);
      set({ permissions: response });
    } catch (err: any) {
      console.error("Failed to fetch permissions:", err);
    } finally {
      set({ permissionsLoading: false });
    }
  },

  clearBackendUser: () => set({ backendUser: null, permissions: null, error: null, loading: false }),
}));
