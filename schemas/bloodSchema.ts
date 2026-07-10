import { z } from "zod";

export const bloodRequestItemSchema = z.object({
  id: z.number(),
  requester_id: z.string(),
  patient_name: z.string(),
  blood_type: z.string(),
  units_needed: z.number(),
  hospital: z.string(),
  contact_phone: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  status: z.string(),
  created_at: z.string(),
});

export const bloodRequestListResponseSchema = z.object({
  requests: z.array(bloodRequestItemSchema),
  total: z.number(),
});

export const updateBloodRequestStatusSchema = z.object({
  status: z.string(),
});

export type BloodRequestItem = z.infer<typeof bloodRequestItemSchema>;
export type BloodRequestListResponse = z.infer<typeof bloodRequestListResponseSchema>;
export type UpdateBloodRequestStatus = z.infer<typeof updateBloodRequestStatusSchema>;
