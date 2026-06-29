// src/schemas/userSchema.ts
import { z } from "zod";

export const backendUserSchema = z.object({
  id: z.string(),
  email: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  first_name: z.string().optional().default(""),
  last_name: z.string().optional().default(""),
  role: z.string().optional().default("admin"),
  is_onboarded: z.boolean().optional().default(false),
  has_subscription: z.boolean().optional().default(false),
  profile_picture_url: z.string().optional().default(""),
  address: z.string().optional().default(""),
});

export type BackendUser = z.infer<typeof backendUserSchema>;

export const syncResponseSchema = z.object({
  id: z.string(),
  role: z.string(),
  is_onboarded: z.boolean(),
  has_subscription: z.boolean(),
});

export type SyncResponse = z.infer<typeof syncResponseSchema>;

export const updateProfileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  phone: z.string().optional().default(""),
  address: z.string().optional().default(""),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const permissionsResponseSchema = z.object({
  is_admin: z.boolean(),
  is_seller: z.boolean(),
  is_buyer: z.boolean(),
  is_subscriber: z.boolean(),
  is_onboarded: z.boolean(),
});

export type PermissionsResponse = z.infer<typeof permissionsResponseSchema>;

export const actionResponseSchema = z.object({
  status: z.string().optional(),
  message: z.string(),
});

export type ActionResponse = z.infer<typeof actionResponseSchema>;

export const userListItemSchema = z.object({
  id: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  first_name: z.string(),
  last_name: z.string(),
  role: z.string(),
  is_onboarded: z.boolean(),
  kyc_status: z.string(),
  is_suspended: z.boolean(),
});

export const userListResponseSchema = z.object({
  users: z.array(userListItemSchema),
  total: z.number(),
});

export type UserListItem = z.infer<typeof userListItemSchema>;
export type UserListResponse = z.infer<typeof userListResponseSchema>;

export const userDetailsResponseSchema = z.object({
  id: z.string(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  first_name: z.string(),
  last_name: z.string(),
  address: z.string().nullable().optional(),
  role: z.string(),
  is_onboarded: z.boolean(),
  has_subscription: z.boolean(),
  auth_source: z.string(),
  kyc_status: z.string(),
  profile_picture_url: z.string(),
  bio: z.string().nullable().optional(),
  social_links: z.string().nullable().optional(),
  is_suspended: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type UserDetailsResponse = z.infer<typeof userDetailsResponseSchema>;

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  address?: string;
  role?: string;
  is_onboarded?: boolean;
  has_subscription?: boolean;
  kyc_status?: string;
}
