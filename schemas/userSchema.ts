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
  is_cod_enabled: z.boolean().optional().default(false),
  kyc_status: z.string().optional(),
  is_suspended: z.boolean().optional(),
  // Gamification fields (July 2026)
  community_score: z.number().optional().default(0),
  reward_points: z.number().optional().default(0),
  badge: z.string().nullable().optional(),
});

export const userListResponseSchema = z.object({
  users: z.array(userListItemSchema),
  total: z.number(),
});

export type UserListItem = z.infer<typeof userListItemSchema>;
export type UserListResponse = z.infer<typeof userListResponseSchema>;

export const activeAssignmentSummarySchema = z.object({
  assignment_id: z.number(),
  agent_id: z.string(),
  status: z.string(),
});

export type ActiveAssignmentSummary = z.infer<typeof activeAssignmentSummarySchema>;

export const userDetailsResponseSchema = z
  .object({
    id: z.string(),
    email: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    first_name: z.string(),
    last_name: z.string(),
    address: z.string().nullable().optional(),
    role: z.string(),
    is_onboarded: z.boolean(),
    is_cod_enabled: z.boolean().optional().default(false),
    has_subscription: z.boolean(),
    auth_source: z.string().optional(),
    auth_provider: z.string().optional(),
    kyc_status: z.string(),
    profile_picture_url: z.string().nullable().optional().default(""),
    bio: z.string().nullable().optional(),
    social_links: z.string().nullable().optional(),
    is_suspended: z.boolean(),
    created_at: z.string(),
    updated_at: z.string(),
    community_score: z.number().optional().default(0),
    reward_points: z.number().optional().default(0),
    badge: z.string().nullable().optional(),
    created_by_agent_id: z.string().nullable().optional(),
    onboarding_source: z.string().optional(),
    onboarded_by_agent_id: z.string().nullable().optional(),
    onboarded_at: z.string().nullable().optional(),
    active_assignment: activeAssignmentSummarySchema.nullable().optional(),
  })
  .passthrough()
  .transform((data) => ({
    ...data,
    auth_source: data.auth_source || data.auth_provider || "—",
    auth_provider: data.auth_provider || data.auth_source || "—",
    profile_picture_url: data.profile_picture_url || "",
  }));

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
