// src/schemas/logSchema.ts
import { z } from "zod";

export const auditLogListItemSchema = z.object({
  id: z.number(),
  actor_id: z.string(),
  action: z.string(),
  entity_type: z.string(),
  entity_id: z.string(),
  old_state: z.string().optional(),
  new_state: z.string().optional(),
  created_at: z.string(),
});

export const auditLogListResponseSchema = z.object({
  logs: z.array(auditLogListItemSchema),
  total: z.number(),
});

export type AuditLogListItem = z.infer<typeof auditLogListItemSchema>;
export type AuditLogListResponse = z.infer<typeof auditLogListResponseSchema>;
