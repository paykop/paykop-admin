// src/schemas/dashboardSchema.ts
import { z } from "zod";

export const dashboardCountsSchema = z.object({
  total_users: z.number(),
  buyers: z.number(),
  sellers: z.number(),
  admins: z.number(),
  pending_products: z.number(),
  approved_products: z.number(),
  rejected_products: z.number(),
});

export const dashboardResponseSchema = z.object({
  message: z.string(),
  counts: dashboardCountsSchema,
});

export type DashboardResponse = z.infer<typeof dashboardResponseSchema>;
