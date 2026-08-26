// src/lib/useAuth.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { getAccessToken, clearTokens, handleLogout } from "./api/client";
import { useUserStore } from "../store/useUserStore";
import { logoutAdmin } from "../services/authService";

export function useAuth() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const backendUser = useUserStore((state) => state.backendUser);

  useEffect(() => {
    const currentToken = getAccessToken();
    setToken(currentToken);
    setIsLoaded(true);
  }, []);

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
