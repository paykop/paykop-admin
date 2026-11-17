import { z } from "zod";
import { baseUserDetailsResponseSchema } from "./userSchema";

export const agentListItemSchema = z.object({
  id: z.string(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  first_name: z.string(),
  last_name: z.string(),
  is_suspended: z.boolean().optional().default(false),
  active_managed_sellers: z.number().optional().default(0),
  trial_grants: z.number().optional().default(0),
});

export const agentListResponseSchema = z.object({
  agents: z.array(agentListItemSchema),
  total: z.number(),
});

export type AgentListItem = z.infer<typeof agentListItemSchema>;
export type AgentListResponse = z.infer<typeof agentListResponseSchema>;

export const agentAssignmentSummarySchema = z.object({
  id: z.number(),
  seller_id: z.string(),
  seller_name: z.string().optional().default(""),
  status: z.string(),
  assigned_by: z.string().nullable().optional(),
  created_at: z.string(),
  revoked_at: z.string().nullable().optional(),
});

export type AgentAssignmentSummary = z.infer<typeof agentAssignmentSummarySchema>;

export const agentDetailResponseSchema = baseUserDetailsResponseSchema
  .extend({
    active_managed_sellers: z.number().optional().default(0),
    trial_grants: z.number().optional().default(0),
    assignments: z.array(agentAssignmentSummarySchema).optional().default([]),
  })
  .transform((data) => ({
    ...data,
    auth_source: data.auth_source || data.auth_provider || "—",
    auth_provider: data.auth_provider || data.auth_source || "—",
    profile_picture_url: data.profile_picture_url || "",
  }));

export type AgentDetailResponse = z.infer<typeof agentDetailResponseSchema>;

export const createAgentRequestSchema = z
  .object({
    user_id: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
  })
  .refine((data) => Boolean(data.user_id?.trim()) || Boolean(data.email?.trim()), {
    message: "Either user_id or email is required",
  });

export type CreateAgentRequest = z.infer<typeof createAgentRequestSchema>;

export const createAssignmentRequestSchema = z.object({
  seller_id: z.string().min(1),
  agent_id: z.string().min(1),
});

export type CreateAssignmentRequest = z.infer<typeof createAssignmentRequestSchema>;

export const assignmentResponseSchema = z.object({
  id: z.number(),
  seller_id: z.string(),
  agent_id: z.string(),
  status: z.string(),
  assigned_by: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string().optional(),
  revoked_at: z.string().nullable().optional(),
});

export type AssignmentResponse = z.infer<typeof assignmentResponseSchema>;

export const assignmentsListResponseSchema = z.object({
  assignments: z.array(agentAssignmentSummarySchema),
});

export type AssignmentsListResponse = z.infer<typeof assignmentsListResponseSchema>;

export const agentActionResponseSchema = z.object({
  status: z.string().optional(),
  message: z.string(),
});

export type AgentActionResponse = z.infer<typeof agentActionResponseSchema>;
