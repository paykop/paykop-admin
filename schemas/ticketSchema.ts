import { z } from "zod";

export const TICKET_STATUSES = [
  "open",
  "in_progress",
  "waiting_user",
  "resolved",
  "closed",
] as const;

export const TICKET_PRIORITIES = ["low", "medium", "high", "urgent"] as const;

// UI model schemas (used by store and components)
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

// Raw API response schemas (backend contract)
export const ticketMessageRawSchema = z.object({
  id: z.number(),
  ticket_id: z.number().optional(),
  author_user_id: z.string().optional(),
  author_id: z.string().optional(),
  author_name: z.string().optional(),
  author_role: z.string().optional(),
  message: z.string(),
  is_internal: z.boolean().optional(),
  created_at: z.string().optional(),
}).passthrough();

export const ticketRawSchema = z.object({
  id: z.number(),
  subject: z.string(),
  status: z.string(),
  priority: z.string().optional(),
  user_id: z.string().optional(),
  user_email: z.string().optional(),
  user_first_name: z.string().optional(),
  user_last_name: z.string().optional(),
  customer_id: z.string().optional(),
  customer_email: z.string().optional(),
  customer_name: z.string().optional(),
  assigned_to: z.string().optional().nullable(),
  ticket_number: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  messages: z.array(ticketMessageRawSchema).optional(),
}).passthrough();

export const ticketListRawResponseSchema = z.object({
  tickets: z.array(ticketRawSchema),
  total: z.number(),
});

export const ticketDetailResponseSchema = z.object({
  ticket: ticketRawSchema,
});

export const ticketStatusResponseSchema = z.object({
  status: z.string(),
});

export const ticketMessageResponseSchema = z.object({
  message: ticketMessageRawSchema,
});

export type TicketMessage = z.infer<typeof ticketMessageSchema>;
export type TicketItem = z.infer<typeof ticketItemSchema>;
export type TicketListResponse = z.infer<typeof ticketListResponseSchema>;
export type TicketActionResponse = z.infer<typeof ticketActionResponseSchema>;
export type UpdateTicketStatusInput = z.infer<typeof updateTicketStatusSchema>;
export type CreateTicketReplyInput = z.infer<typeof createTicketReplySchema>;
export type TicketMessageRaw = z.infer<typeof ticketMessageRawSchema>;
export type TicketRaw = z.infer<typeof ticketRawSchema>;
