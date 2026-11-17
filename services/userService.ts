// src/services/userService.ts
import { z } from "zod";
import { apiRequest } from "./apiService";
import {
  backendUserSchema,
  permissionsResponseSchema,
  actionResponseSchema,
  UpdateProfileInput,
  userListResponseSchema,
  UserListResponse,
  userDetailsResponseSchema,
  UserDetailsResponse,
  UpdateUserRequest,
} from "../schemas/userSchema";

export async function fetchUserProfile(_token?: string) {
  return apiRequest("/api/v1/auth/me", backendUserSchema);
}

export async function updateUserProfile(_token: string, data: UpdateProfileInput) {
  return apiRequest("/api/v1/users/me", actionResponseSchema, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function fetchUserPermissions(_token?: string) {
  return apiRequest("/api/v1/users/me/permissions", permissionsResponseSchema);
}

export async function testAdminDashboard(_token?: string) {
  return apiRequest("/api/v1/admin/dashboard", z.object({ message: z.string() }), {
    method: "GET",
  });
}

export async function fetchServerHealth() {
  return apiRequest("/health", z.object({ status: z.string() }));
}

export async function fetchUsers(
  _token: string,
  page = 1,
  limit = 10,
  role?: string
): Promise<UserListResponse> {
  const params: Record<string, string> = {
    page: page.toString(),
    limit: limit.toString(),
  };
  if (role) params.role = role;

  return apiRequest("/api/v1/admin/users", userListResponseSchema, { params });
}

export async function suspendUser(_token: string, id: string, suspend: boolean) {
  return apiRequest(`/api/v1/admin/users/${id}/suspend`, actionResponseSchema, {
    method: "PUT",
    body: JSON.stringify({ suspend }),
  });
}

export async function verifyUser(_token: string, id: string) {
  return apiRequest(`/api/v1/admin/users/${id}/verify`, actionResponseSchema, {
    method: "PUT",
  });
}

export async function getUser(_token: string, id: string): Promise<UserDetailsResponse> {
  return apiRequest(`/api/v1/admin/users/${id}`, userDetailsResponseSchema);
}

export async function updateUser(_token: string, id: string, data: UpdateUserRequest) {
  return apiRequest(`/api/v1/admin/users/${id}`, actionResponseSchema, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function updateUserRole(_token: string, id: string, role: string) {
  return apiRequest(`/api/v1/admin/users/${id}/role`, actionResponseSchema, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}
