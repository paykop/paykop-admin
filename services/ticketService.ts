import { apiRequest } from "./apiService";
import {
  ticketListResponseSchema,
  ticketItemSchema,
  ticketActionResponseSchema,
  TicketListResponse,
  TicketItem,
  TicketActionResponse,
  UpdateTicketStatusInput,
  CreateTicketReplyInput,
} from "../schemas/ticketSchema";

export async function fetchTickets(
  token: string,
  page = 1,
  limit = 20,
  status?: string,
  search?: string
): Promise<TicketListResponse> {
  const params: Record<string, string> = {
    page: page.toString(),
    limit: limit.toString(),
  };
  if (status && status !== "all") params.status = status;
  if (search?.trim()) params.search = search.trim();

  return apiRequest("/api/v1/admin/tickets", ticketListResponseSchema, {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
}

export async function fetchTicketDetail(
  token: string,
  id: number | string
): Promise<TicketItem> {
  return apiRequest(`/api/v1/admin/tickets/${id}`, ticketItemSchema, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function updateTicketStatus(
  token: string,
  id: number | string,
  data: UpdateTicketStatusInput
): Promise<TicketItem> {
  return apiRequest(`/api/v1/admin/tickets/${id}/status`, ticketItemSchema, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

export async function createTicketReply(
  token: string,
  id: number | string,
  data: CreateTicketReplyInput
): Promise<TicketActionResponse> {
  return apiRequest(`/api/v1/admin/tickets/${id}/replies`, ticketActionResponseSchema, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}
