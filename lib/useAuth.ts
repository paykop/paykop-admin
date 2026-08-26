// src/lib/useAuth.ts
"use client";

import { useCallback, useSyncExternalStore } from "react";
import { getAccessToken, clearTokens, handleLogout } from "./api/client";
import { useUserStore } from "../store/useUserStore";
import { logoutAdmin } from "../services/authService";

const emptySubscribe = () => () => {};

export function useAuth() {
  const isLoaded = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const token = useSyncExternalStore(emptySubscribe, getAccessToken, () => null);
  const backendUser = useUserStore((state) => state.backendUser);

  const getToken = useCallback(async (): Promise<string | null> => {
    return getAccessToken();
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutAdmin();
    } catch {
      clearTokens();
    } finally {
      useUserStore.getState().clearBackendUser();
      handleLogout();
    }
  }, []);

  return {
    isLoaded,
    isSignedIn: Boolean(token),
    userId: backendUser?.id || (token ? "admin" : null),
    getToken,
    token,
    logout,
  };
}

export default useAuth;
