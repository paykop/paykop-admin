"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { handleLogout } from "./api/client";
import { useUserStore } from "../store/useUserStore";
import {
  logoutAdmin,
  resolveSessionStatus,
  type SessionStatus,
} from "../services/authService";

interface AuthContextValue {
  isLoaded: boolean;
  isSignedIn: boolean;
  sessionStatus: SessionStatus | null;
  userId: string | null;
  getToken: () => Promise<string | null>;
  token: string | null;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function subscribeToAuth(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("paykop-auth-change", onStoreChange);
  return () => {
    window.removeEventListener("paykop-auth-change", onStoreChange);
  };
}

let sessionCheckInFlight: Promise<SessionStatus> | null = null;

async function runSessionCheck(): Promise<SessionStatus> {
  if (sessionCheckInFlight) {
    return sessionCheckInFlight;
  }

  sessionCheckInFlight = resolveSessionStatus().finally(() => {
    sessionCheckInFlight = null;
  });

  return sessionCheckInFlight;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus | null>(null);
  const authVersion = useSyncExternalStore(subscribeToAuth, () => 0, () => 0);
  const backendUser = useUserStore((state) => state.backendUser);

  const applySessionStatus = useCallback((status: SessionStatus) => {
    setSessionStatus(status);
    setIsLoaded(true);
  }, []);

  const refreshSession = useCallback(async () => {
    const status = await runSessionCheck();
    applySessionStatus(status);
  }, [applySessionStatus]);

  useEffect(() => {
    let cancelled = false;

    runSessionCheck().then((status) => {
      if (!cancelled) {
        applySessionStatus(status);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [authVersion, applySessionStatus]);

  const isSignedIn = sessionStatus === "authenticated";

  const getToken = useCallback(async (): Promise<string | null> => {
    const status = await runSessionCheck();
    setSessionStatus((prev) => (prev === status ? prev : status));
    setIsLoaded(true);
    return status === "authenticated" ? "session" : null;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutAdmin();
    } finally {
      useUserStore.getState().clearBackendUser();
      setSessionStatus("unauthenticated");
      setIsLoaded(true);
      handleLogout();
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoaded,
      isSignedIn,
      sessionStatus,
      userId: backendUser?.id || (isSignedIn ? "admin" : null),
      getToken,
      token: isSignedIn ? "session" : null,
      logout,
      refreshSession,
    }),
    [
      isLoaded,
      isSignedIn,
      sessionStatus,
      backendUser?.id,
      getToken,
      logout,
      refreshSession,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
