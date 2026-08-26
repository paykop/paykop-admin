import { z } from "zod";

export const serviceItemSchema = z.object({
  id: z.number(),
  provider_id: z.string(),
  category_id: z.number(),
  category_name: z.string(),
  title: z.string(),
  description: z.string().optional().nullable(),
  fees: z.number(),
  status: z.string(),
  address: z.string(),
  fulfillment_type: z.string().nullable().optional(),
  service_radius_km: z.number().nullable().optional(),
  is_pay_on_service: z.boolean().optional().default(false),
  created_at: z.string(),
});

export const serviceListResponseSchema = z.object({
  services: z.array(serviceItemSchema),
  total: z.number(),
});

export const serviceStatusResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
});

export type ServiceItem = z.infer<typeof serviceItemSchema>;
export type ServiceListResponse = z.infer<typeof serviceListResponseSchema>;
export type ServiceStatusResponse = z.infer<typeof serviceStatusResponseSchema>;
