// src/services/userService.ts
import { z } from "zod";
import { apiRequest } from "./apiService";
import {
  backendUserSchema,
  syncResponseSchema,
  permissionsResponseSchema,
  actionResponseSchema,
  UpdateProfileInput,
  userListResponseSchema,
  UserListResponse,
  userDetailsResponseSchema,
  UserDetailsResponse,
  UpdateUserRequest,
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

// ==========================================
// ADMIN USER METHODS
// ==========================================

/**
 * Fetch users list (Admin)
 */
export async function fetchUsers(token: string, page = 1, limit = 10, role?: string): Promise<UserListResponse> {
  const params: Record<string, string> = {
    page: page.toString(),
    limit: limit.toString(),
  };
  if (role) params.role = role;

  return apiRequest("/api/v1/admin/users", userListResponseSchema, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params,
  });
}

/**
 * Suspend user (Admin)
 */
export async function suspendUser(token: string, id: string, suspend: boolean): Promise<any> {
  return apiRequest(`/api/v1/admin/users/${id}/suspend`, z.any(), {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ suspend }),
  });
}

/**
 * Verify user (Admin)
 */
export async function verifyUser(token: string, id: string): Promise<any> {
  return apiRequest(`/api/v1/admin/users/${id}/verify`, z.any(), {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Fetch single user details (Admin)
 */
export async function getUser(token: string, id: string): Promise<UserDetailsResponse> {
  return apiRequest(`/api/v1/admin/users/${id}`, userDetailsResponseSchema, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Update user details (Admin)
 */
export async function updateUser(token: string, id: string, data: UpdateUserRequest): Promise<any> {
  return apiRequest(`/api/v1/admin/users/${id}`, z.any(), {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
}

/**
 * Update user role (Admin)
 */
export async function updateUserRole(token: string, id: string, role: string): Promise<any> {
  console.log(`[API] Updating role for user ${id} to ${role}`);
  return apiRequest(`/api/v1/admin/users/${id}/role`, z.any(), {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ role }),
  });
}
