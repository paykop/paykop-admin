import type { TicketItem, TicketMessage } from "@/schemas/ticketSchema";
import type { TicketMessageRaw, TicketRaw } from "@/schemas/ticketSchema";

function formatCustomerName(firstName?: string, lastName?: string): string | undefined {
  const name = [firstName, lastName].filter(Boolean).join(" ").trim();
  return name || undefined;
}

export function mapMessageFromAPI(raw: TicketMessageRaw): TicketMessage {
  return {
    id: raw.id,
    ticket_id: raw.ticket_id,
    author_id: raw.author_user_id ?? raw.author_id,
    author_name: raw.author_name,
    author_role: raw.author_role,
    message: raw.message,
    is_internal: raw.is_internal ?? false,
    created_at: raw.created_at,
  };
}

export function mapTicketFromAPI(raw: TicketRaw): TicketItem {
  const messages = (raw.messages ?? []).map(mapMessageFromAPI);

  return {
    id: raw.id,
    subject: raw.subject,
    status: raw.status,
    priority: raw.priority ?? "medium",
    customer_id: raw.user_id ?? raw.customer_id,
    customer_email: raw.user_email ?? raw.customer_email,
    customer_name:
      raw.customer_name ??
      formatCustomerName(raw.user_first_name, raw.user_last_name),
    assigned_to: raw.assigned_to ?? null,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
    messages,
    ticket_number: raw.ticket_number,
    category: raw.category,
    description: raw.description,
  };
}

/** Map UI status filter values to backend query param values. */
export function mapStatusFilterToAPI(status: string): string | undefined {
  if (!status || status === "all") return undefined;
  return status;
}

export function formatTicketStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    open: "Open",
    in_progress: "In progress",
    waiting_user: "Waiting for user",
    resolved: "Resolved",
    closed: "Closed",
  };
  return labels[status] ?? status.replace(/_/g, " ");
}
