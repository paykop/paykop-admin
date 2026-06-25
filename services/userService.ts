// src/services/userService.ts
import { z } from "zod";
import { apiRequest } from "./apiService";
import {
  backendUserSchema,
  syncResponseSchema,
  permissionsResponseSchema,
  actionResponseSchema,
  UpdateProfileInput,
} from "../schemas/userSchema";

/**
 * Sync user from Clerk token to Neon DB
 */
export async function syncUser(token: string) {
  return apiRequest("/api/v1/auth/sync", syncResponseSchema, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Fetch local user profile details from Neon DB
 */
export async function fetchUserProfile(token: string) {
  return apiRequest("/api/v1/auth/me", backendUserSchema, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Update user profile details
 */
export async function updateUserProfile(token: string, data: UpdateProfileInput) {
  return apiRequest("/api/v1/users/me", actionResponseSchema, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

/**
 * Fetch role-based capabilities/permissions
 */
export async function fetchUserPermissions(token: string) {
  return apiRequest("/api/v1/users/me/permissions", permissionsResponseSchema, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Test Admin-gated dashboard endpoint
 */
export async function testAdminDashboard(token: string) {
  return apiRequest("/api/v1/admin/dashboard", z.object({ message: z.string() }), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Fetch server health status (public endpoint)
 */
export async function fetchServerHealth() {
  return apiRequest("/health", z.object({ status: z.string() }));
}
