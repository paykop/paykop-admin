// src/schemas/dashboardSchema.ts
import { z } from "zod";

export const dashboardCountsSchema = z.object({
  total_users: z.number(),
  buyers: z.number(),
  sellers: z.number(),
  agents: z.number().optional().default(0),
  admins: z.number(),
  pending_products: z.number(),
  approved_products: z.number(),
  rejected_products: z.number(),
});

export const dashboardResponseSchema = z.object({
  message: z.string(),
  counts: dashboardCountsSchema,
});

/** GET /admin/metrics — operational diagnostics */
export const adminMetricsSchema = z
  .object({
    auth_error_count: z.number().optional().default(0),
    geocode_call_count: z.number().optional().default(0),
    geocode_cache_hit_count: z.number().optional().default(0),
    geocode_cache_hit_rate: z.string().optional().default("—"),
    chat_persistence_error_count: z.number().optional().default(0),
    uptime_seconds: z.number().optional().default(0),
    uptime_human: z.string().optional().default("—"),
  })
  .passthrough();

export type DashboardResponse = z.infer<typeof dashboardResponseSchema>;
export type AdminMetrics = z.infer<typeof adminMetricsSchema>;
