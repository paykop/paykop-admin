import { z } from "zod";

export const farmSellerItemSchema = z.object({
  user_id: z.string(),
  role: z.string().default("seller"),
  status: z.string().default("pending"), // "pending", "active", "rejected"
  vertical: z.string().default("farm"),
  approved_by: z.string().nullable().optional(),
  approved_at: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  first_name: z.string().optional().default(""),
  last_name: z.string().optional().default(""),
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  kyc_status: z.string().optional().default("unverified"),
});

export const farmSellerListResponseSchema = z.object({
  sellers: z.array(farmSellerItemSchema).default([]),
  total: z.number().default(0),
});

export const farmSellerActionResponseSchema = z.object({
  message: z.string(),
  user_id: z.string(),
  status: z.string(),
});

export type FarmSellerItem = z.infer<typeof farmSellerItemSchema>;
export type FarmSellerListResponse = z.infer<typeof farmSellerListResponseSchema>;
export type FarmSellerActionResponse = z.infer<typeof farmSellerActionResponseSchema>;
