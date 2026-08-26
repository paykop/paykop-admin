// src/schemas/notificationSchema.ts
import { z } from "zod";

export const notificationItemSchema = z.object({
  id: z.number(),
  type: z.string().optional().default("general"),
  title: z.string(),
  body: z.string(),
  is_read: z.boolean().optional().default(false),
  created_at: z.string().optional(),
});

export const notificationListResponseSchema = z.object({
  notifications: z.array(notificationItemSchema).optional().default([]),
  total: z.number().optional().default(0),
  page: z.number().optional().default(1),
  limit: z.number().optional().default(20),
});

export const notificationActionResponseSchema = z.object({
  message: z.string().optional(),
});

export type NotificationItem = z.infer<typeof notificationItemSchema>;
export type NotificationListResponse = z.infer<typeof notificationListResponseSchema>;
