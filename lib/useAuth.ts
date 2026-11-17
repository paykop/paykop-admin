// src/lib/useAuth.ts
"use client";

import { useAuthContext } from "./AuthProvider";

export function useAuth() {
  return useAuthContext();
}

export default useAuth;
