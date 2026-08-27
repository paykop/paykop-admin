import { apiRequest } from "./apiService";
import { mapStatusFilterToAPI, mapTicketFromAPI } from "@/lib/tickets/mapTicket";
import {
  ticketListRawResponseSchema,
  ticketDetailResponseSchema,
  ticketStatusResponseSchema,
  ticketMessageResponseSchema,
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
  const apiStatus = mapStatusFilterToAPI(status ?? "");
  if (apiStatus) params.status = apiStatus;
  if (search?.trim()) params.q = search.trim();

  const data = await apiRequest("/api/v1/admin/tickets", ticketListRawResponseSchema, {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });

  return {
    tickets: data.tickets.map(mapTicketFromAPI),
    total: data.total,
  };
}

export async function fetchTicketDetail(
  token: string,
  id: number | string
): Promise<TicketItem> {
  const data = await apiRequest(`/api/v1/admin/tickets/${id}`, ticketDetailResponseSchema, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return mapTicketFromAPI(data.ticket);
}

export async function updateTicketStatus(
  token: string,
  id: number | string,
  data: UpdateTicketStatusInput
): Promise<TicketItem> {
  await apiRequest(`/api/v1/admin/tickets/${id}/status`, ticketStatusResponseSchema, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return fetchTicketDetail(token, id);
}

export async function createTicketReply(
  token: string,
  id: number | string,
  data: CreateTicketReplyInput
): Promise<TicketActionResponse> {
  await apiRequest(`/api/v1/admin/tickets/${id}/messages`, ticketMessageResponseSchema, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return { status: "ok" };
}
