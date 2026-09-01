// src/store/useUserStore.ts
import { create } from "zustand";
import { BackendUser, PermissionsResponse } from "../schemas/userSchema";
import {
  fetchUserProfile,
  fetchUserPermissions,
} from "../services/userService";
import { clearTokens } from "../lib/api/client";
import { resolveSessionStatus } from "../services/authService";
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

const EXPECTED_AUTH_CODES = new Set([
  "USER_NOT_FOUND",
  "INVALID_TOKEN",
  "TOKEN_EXPIRED",
]);

function isExpectedAuthFailure(err: unknown): boolean {
  if (!(err instanceof ApiError) || err.status !== 401) return false;

  const info = err.info as { code?: string; error?: string; message?: string } | undefined;
  const code = (info?.code || "").toUpperCase();
  if (EXPECTED_AUTH_CODES.has(code)) return true;

  const errorKey = (info?.error || "").toLowerCase();
  if (
    errorKey === "user_not_found" ||
    errorKey === "invalid_token" ||
    errorKey === "token_expired"
  ) {
    return true;
  }

  const msg = (err.message || info?.message || "").toLowerCase();
  return (
    msg.includes("user not found") ||
    msg.includes("invalid or malformed access token") ||
    msg.includes("token expired") ||
    msg.includes("access token has expired")
  );
}

export const useUserStore = create<UserState>((set, get) => ({
  backendUser: null,
  permissions: null,
  loading: false,
  permissionsLoading: false,
  error: null,
  setBackendUser: (backendUser) => set({ backendUser }),

  fetchProfile: async (getToken?) => {
    if (fetchProfileInFlight) {
      return fetchProfileInFlight;
    }

    fetchProfileInFlight = (async () => {
      set({ loading: true, error: null });
      try {
        if (getToken) {
          if (!(await getToken())) {
            throw new Error("No authentication token found. Please sign in again.");
          }
        } else {
          const status = await resolveSessionStatus();
          if (status === "error") {
            throw new Error("Could not verify session. Check your connection and try again.");
          }
          if (status !== "authenticated") {
            throw new Error("No authentication token found. Please sign in again.");
          }
        }

        const response = await fetchUserProfile();

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
            const perms = await fetchUserPermissions();
            set({ permissions: perms });
          } catch (permsErr: unknown) {
            if (!(permsErr instanceof ApiError && permsErr.status === 429)) {
              console.error("Failed to fetch user permissions in background:", permsErr);
            }
          }
        }

        return response;
      } catch (err: unknown) {
        if (isExpectedAuthFailure(err)) {
          clearTokens();
          set({ backendUser: null, permissions: null, error: null });
          return null;
        }

        console.error("Failed to fetch backend profile:", err);
        if (err instanceof ApiError && (err.status === 401 || err.status === 404)) {
          clearTokens();
        }
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

  fetchPermissions: async (getToken?) => {
    if (get().permissions || get().permissionsLoading) return;

    set({ permissionsLoading: true });
    try {
      const sessionActive = getToken
        ? Boolean(await getToken())
        : (await resolveSessionStatus()) === "authenticated";
      if (!sessionActive) return;
      const response = await fetchUserPermissions();
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
