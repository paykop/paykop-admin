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


