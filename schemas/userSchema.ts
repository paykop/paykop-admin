// src/schemas/userSchema.ts
import { z } from "zod";

export const userProfileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "user", "guest"], {
    message: "Please select a valid role",
  }),
});

export type UserProfileInput = z.infer<typeof userProfileSchema>;

export const backendUserSchema = z.object({
  id: z.string(),
  email: z.string().email().nullable(),
  phone: z.string().nullable().optional(),
  first_name: z.string().optional().default(""),
  last_name: z.string().optional().default(""),
  role: z.string().optional().default("buyer"),
  is_onboarded: z.boolean().optional().default(false),
  has_subscription: z.boolean().optional().default(false),
  profile_picture_url: z.string().optional().default(""),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const profileResponseSchema = z.object({
  message: z.string(),
  user: backendUserSchema,
});

export type BackendUser = z.infer<typeof backendUserSchema>;
export type ProfileResponse = z.infer<typeof profileResponseSchema>;

