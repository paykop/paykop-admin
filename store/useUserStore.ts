// src/store/useUserStore.ts
import { create } from "zustand";
import { BackendUser, PermissionsResponse } from "../schemas/userSchema";
import {
  fetchUserProfile,
  fetchUserPermissions,
  syncUser,
} from "../services/userService";
import { getAccessToken, clearTokens } from "../lib/api/client";
import { isStaff } from "../lib/rbac";
import { getErrorMessage } from "../lib/errors";
import { ApiError } from "../services/apiService";

interface UserState {
  backendUser: BackendUser | null;
  permissions: PermissionsResponse | null;
  loading: boolean;
  permissionsLoading: boolean;
  error: string | null;
  setBackendUser: (backendUser: BackendUser | null) => void;
  fetchProfile: (getToken?: () => Promise<string | null>) => Promise<BackendUser | null>;
  fetchPermissions: (getToken?: () => Promise<string | null>) => Promise<void>;
  clearBackendUser: () => void;
}

/** Shared in-flight profile fetch so concurrent callers (sign-in + layout + Strict Mode) share one request. */
let fetchProfileInFlight: Promise<BackendUser | null> | null = null;

export const useUserStore = create<UserState>((set, get) => ({
  backendUser: null,
  permissions: null,
  loading: false,
  permissionsLoading: false,
  error: null,
  setBackendUser: (backendUser) => set({ backendUser }),

  fetchProfile: async (getToken) => {
    if (fetchProfileInFlight) {
      return fetchProfileInFlight;
    }

    fetchProfileInFlight = (async () => {
      set({ loading: true, error: null });
      try {
        const token = getToken ? await getToken() : getAccessToken();
        if (!token) {
          throw new Error("No authentication token found. Please sign in again.");
        }

        let response: BackendUser;
        try {
          response = await fetchUserProfile(token);
        } catch (err: unknown) {
          const isUserNotFound =
            (err instanceof ApiError &&
              (err.status === 401 || err.status === 404 || err.status === 400)) ||
            getErrorMessage(err).toLowerCase().includes("user not found");

          if (isUserNotFound) {
            const syncRes = await syncUser(token);
            if (isStaff(syncRes.role)) {
              response = await fetchUserProfile(token);
            } else {
              clearTokens();
              throw new Error("Access Denied: Only admin or support staff accounts can access this portal.");
            }
          } else {
            throw err;
          }
        }

        if (!isStaff(response.role)) {
          clearTokens();
          set({
            backendUser: null,
            permissions: null,
            error: "Access Denied: Only admin or support staff accounts can access this portal.",
          });
          return null;
        }

        set({ backendUser: response, error: null });

        // Permissions are optional for the staff gate — skip if already loaded to reduce rate-limit pressure
        if (!get().permissions) {
          try {
            const perms = await fetchUserPermissions(token);
            set({ permissions: perms });
          } catch (permsErr: unknown) {
            if (!(permsErr instanceof ApiError && permsErr.status === 429)) {
              console.error("Failed to fetch user permissions in background:", permsErr);
            }
          }
        }

        return response;
      } catch (err: unknown) {
        console.error("Failed to fetch backend profile:", err);
        const errorMsg =
          err instanceof ApiError && err.status === 401
            ? "Access Denied: This administrator account does not exist in the database."
            : getErrorMessage(err, "Could not connect to backend.");
        set({ backendUser: null, permissions: null, error: errorMsg });
        return null;
      } finally {
        set({ loading: false });
        fetchProfileInFlight = null;
      }
    })();

    return fetchProfileInFlight;
  },

  fetchPermissions: async (getToken) => {
    if (get().permissions || get().permissionsLoading) return;

    set({ permissionsLoading: true });
    try {
      const token = getToken ? await getToken() : getAccessToken();
      if (!token) return;
      const response = await fetchUserPermissions(token);
      set({ permissions: response });
    } catch (err: unknown) {
      if (!(err instanceof ApiError && err.status === 429)) {
        console.error("Failed to fetch permissions:", err);
      }
    } finally {
      set({ permissionsLoading: false });
    }
  },

  clearBackendUser: () => {
    fetchProfileInFlight = null;
    set({ backendUser: null, permissions: null, error: null, loading: false });
  },
}));
