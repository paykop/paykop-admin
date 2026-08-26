// src/schemas/bloodSchema.ts
import { z } from "zod";

export const bloodRequestItemSchema = z.object({
  id: z.union([z.number(), z.string()]),
  requester_id: z.string().optional().nullable(),
  patient_name: z.string().optional().default("Anonymous Patient"),
  blood_type: z.string(),
  units_needed: z.number().optional().default(1),
  hospital: z.string().optional().default("Not specified"),
  contact_phone: z.string().optional().default("N/A"),
  address: z.string().optional().nullable(),
  city_id: z.union([z.number(), z.string()]).optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  status: z.string().optional().default("pending"),
  created_at: z.string().optional(),
}).passthrough();

export const bloodRequestListResponseSchema = z.union([
  z.object({
    requests: z.array(bloodRequestItemSchema),
    total: z.number().optional().default(0),
  }).passthrough(),
  z.array(bloodRequestItemSchema).transform((requests) => ({
    requests,
    total: requests.length,
  })),
]);

export const donorItemSchema = z.object({
  id: z.union([z.number(), z.string()]),
  user_id: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  full_name: z.string().optional().nullable(),
  blood_type: z.string(),
  phone: z.string().optional().nullable(),
  contact_phone: z.string().optional().nullable(),
  city_id: z.union([z.number(), z.string()]).optional().nullable(),
  city_name: z.string().optional().nullable(),
  is_available: z.boolean().optional().default(true),
  last_donated_at: z.string().optional().nullable(),
  created_at: z.string().optional().nullable(),
}).passthrough();

export const donorListResponseSchema = z.union([
  z.object({
    donors: z.array(donorItemSchema),
    total: z.number().optional(),
  }).passthrough(),
  z.array(donorItemSchema).transform((donors) => ({
    donors,
    total: donors.length,
  })),
]);

export const matchingDonorsResponseSchema = z.union([
  z.object({
    donors: z.array(donorItemSchema).optional(),
    matches: z.array(donorItemSchema).optional(),
    total: z.number().optional(),
  }).passthrough().transform((data) => ({
    donors: data.donors || data.matches || [],
    total: data.total || (data.donors || data.matches || []).length,
  })),
  z.array(donorItemSchema).transform((donors) => ({
    donors,
    total: donors.length,
  })),
]);

export const updateBloodRequestStatusSchema = z.object({
  status: z.string(),
});

export type BloodRequestItem = z.infer<typeof bloodRequestItemSchema>;
export type BloodRequestListResponse = z.infer<typeof bloodRequestListResponseSchema>;
export type DonorItem = z.infer<typeof donorItemSchema>;
export type DonorListResponse = z.infer<typeof donorListResponseSchema>;
export type MatchingDonorsResponse = z.infer<typeof matchingDonorsResponseSchema>;
export type UpdateBloodRequestStatus = z.infer<typeof updateBloodRequestStatusSchema>;
