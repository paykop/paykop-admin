import { apiRequest } from "./apiService";
import {
  agentListResponseSchema,
  AgentListResponse,
  agentDetailResponseSchema,
  AgentDetailResponse,
  assignmentsListResponseSchema,
  AssignmentsListResponse,
  createAgentRequestSchema,
  CreateAgentRequest,
  createAssignmentRequestSchema,
  CreateAssignmentRequest,
  assignmentResponseSchema,
  AssignmentResponse,
  agentActionResponseSchema,
  AgentActionResponse,
} from "../schemas/agentSchema";
import { userDetailsResponseSchema, UserDetailsResponse } from "../schemas/userSchema";

/**
 * Fetch agents list (Admin)
 */
export async function fetchAgents(token: string, page = 1, limit = 50): Promise<AgentListResponse> {
  return apiRequest("/api/v1/admin/agents", agentListResponseSchema, {
    headers: { Authorization: `Bearer ${token}` },
    params: { page: page.toString(), limit: limit.toString() },
  });
}

/**
 * Fetch single agent details (Admin)
 */
export async function getAgent(token: string, id: string): Promise<AgentDetailResponse> {
  return apiRequest(`/api/v1/admin/agents/${id}`, agentDetailResponseSchema, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

/**
 * List all assignments for an agent (Admin)
 */
export async function listAgentAssignments(token: string, id: string): Promise<AssignmentsListResponse> {
  return apiRequest(`/api/v1/admin/agents/${id}/assignments`, assignmentsListResponseSchema, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

/**
 * Create or promote an agent (Admin, idempotent)
 */
export async function createAgent(token: string, data: CreateAgentRequest): Promise<UserDetailsResponse> {
  const parsed = createAgentRequestSchema.parse(data);
  return apiRequest("/api/v1/admin/agents", userDetailsResponseSchema, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(parsed),
  });
}

/**
 * Demote agent to buyer and revoke active assignments (Admin)
 */
export async function revokeAgentRole(token: string, id: string): Promise<AgentActionResponse> {
  return apiRequest(`/api/v1/admin/agents/${id}/revoke-role`, agentActionResponseSchema, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
}

/**
 * Assign a seller to an agent (Admin, idempotent)
 */
export async function assignSellerToAgent(
  token: string,
  data: CreateAssignmentRequest
): Promise<AssignmentResponse> {
  const parsed = createAssignmentRequestSchema.parse(data);
  return apiRequest("/api/v1/admin/seller-agent-assignments", assignmentResponseSchema, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(parsed),
  });
}

/**
 * Revoke a seller–agent assignment (Admin, idempotent)
 */
export async function revokeAssignment(token: string, assignmentId: number): Promise<AgentActionResponse> {
  return apiRequest(
    `/api/v1/admin/seller-agent-assignments/${assignmentId}/revoke`,
    agentActionResponseSchema,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}
