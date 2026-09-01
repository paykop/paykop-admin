// src/lib/useAuth.ts
"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { handleLogout } from "./api/client";
import { useUserStore } from "../store/useUserStore";
import { checkSession, logoutAdmin } from "../services/authService";

const emptySubscribe = () => () => {};

function subscribeToAuth(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("paykop-auth-change", onStoreChange);
  return () => {
    window.removeEventListener("paykop-auth-change", onStoreChange);
  };
}

export function useAuth() {
  const isLoaded = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const authVersion = useSyncExternalStore(subscribeToAuth, () => 0, () => 0);
  const backendUser = useUserStore((state) => state.backendUser);

  useEffect(() => {
    let cancelled = false;
    checkSession().then((authenticated) => {
      if (!cancelled) setIsSignedIn(authenticated);
    });
    return () => {
      cancelled = true;
    };
  }, [authVersion]);

  const getToken = useCallback(async (): Promise<string | null> => {
    const authenticated = await checkSession();
    return authenticated ? "session" : null;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutAdmin();
    } finally {
      useUserStore.getState().clearBackendUser();
      setIsSignedIn(false);
      handleLogout();
    }
  }, []);

  return {
    isLoaded,
    isSignedIn,
    userId: backendUser?.id || (isSignedIn ? "admin" : null),
    getToken,
    token: isSignedIn ? "session" : null,
    logout,
  };
}

export default useAuth;
