import { z } from "zod";

export const TICKET_STATUSES = ["open", "pending", "resolved", "closed"] as const;
export const TICKET_PRIORITIES = ["low", "medium", "high", "urgent"] as const;

export const ticketMessageSchema = z.object({
  id: z.number(),
  ticket_id: z.number().optional(),
  author_id: z.string().optional(),
  author_name: z.string().optional(),
  author_role: z.string().optional(),
  message: z.string(),
  is_internal: z.boolean().optional().default(false),
  created_at: z.string().optional(),
}).passthrough();

export const ticketItemSchema = z.object({
  id: z.number(),
  subject: z.string(),
  status: z.string(),
  priority: z.string().optional().default("medium"),
  customer_id: z.string().optional(),
  customer_email: z.string().optional(),
  customer_name: z.string().optional(),
  assigned_to: z.string().optional().nullable(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  messages: z.array(ticketMessageSchema).optional().default([]),
}).passthrough();

export const ticketListResponseSchema = z.object({
  tickets: z.array(ticketItemSchema),
  total: z.number(),
});

export const ticketActionResponseSchema = z.object({
  status: z.string().optional(),
  message: z.string().optional(),
});

export const updateTicketStatusSchema = z.object({
  status: z.string().min(1),
});

export const createTicketReplySchema = z.object({
  message: z.string().min(1),
});

export type TicketMessage = z.infer<typeof ticketMessageSchema>;
export type TicketItem = z.infer<typeof ticketItemSchema>;
export type TicketListResponse = z.infer<typeof ticketListResponseSchema>;
export type TicketActionResponse = z.infer<typeof ticketActionResponseSchema>;
export type UpdateTicketStatusInput = z.infer<typeof updateTicketStatusSchema>;
export type CreateTicketReplyInput = z.infer<typeof createTicketReplySchema>;
