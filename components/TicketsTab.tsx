"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import { useAdminTicketsStore } from "../store/useAdminTicketsStore";
import RoleAccessBanner from "./RoleAccessBanner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import {
  Loader2,
  Eye,
  MessageSquare,
  AlertCircle,
  Search,
  Ticket,
} from "lucide-react";
import { toast } from "./ui/toast";
import { TICKET_STATUSES } from "../schemas/ticketSchema";
import { formatTicketStatusLabel } from "@/lib/tickets/mapTicket";
import { getErrorMessage } from "../lib/errors";
import { useTour } from "@/lib/tour/useTour";

export default function TicketsTab() {
  const { getToken } = useAuth();
  const {
    tickets,
    loading,
    error,
    statusFilter,
    searchQuery,
    setStatusFilter,
    setSearchQuery,
    fetchTickets,
    selected,
    detailsLoading,
    fetchDetail,
    updateStatus,
    reply,
    clearSelected,
  } = useAdminTicketsStore();

  useTour("support-tickets", {
    ready: !loading && tickets.length > 0,
  });

  const [viewOpen, setViewOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [searchInput, setSearchInput] = useState(searchQuery);

  useEffect(() => {
    fetchTickets(getToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getToken, statusFilter, searchQuery]);

  const handleOpen = async (id: number) => {
    setViewOpen(true);
    setReplyText("");
    await fetchDetail(getToken, id);
  };

  const handleStatusChange = async (id: number, status: string) => {
    setProcessingId(id);
    try {
      await updateStatus(getToken, id, status);
      toast.success(`Ticket marked as ${formatTicketStatusLabel(status)}`);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to update ticket status"));
    } finally {
      setProcessingId(null);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !replyText.trim()) return;
    setProcessingId(selected.id);
    try {
      await reply(getToken, selected.id, replyText.trim());
      toast.success("Reply sent");
      setReplyText("");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to send reply"));
    } finally {
      setProcessingId(null);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      open: "bg-blue-50 text-blue-700 border-blue-200",
      in_progress: "bg-violet-50 text-violet-700 border-violet-200",
      waiting_user: "bg-amber-50 text-amber-700 border-amber-200",
      resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
      closed: "bg-slate-100 text-slate-600 border-slate-200",
    };
    return map[status] || "bg-slate-100 text-slate-600 border-slate-200";
  };

  const priorityBadge = (priority?: string) => {
    const map: Record<string, string> = {
      low: "bg-slate-100 text-slate-600",
      medium: "bg-sky-100 text-sky-700",
      high: "bg-orange-100 text-orange-700",
      urgent: "bg-rose-100 text-rose-700",
    };
    return map[priority || "medium"] || "bg-slate-100 text-slate-600";
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <RoleAccessBanner />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Support Tickets</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage customer inquiries, replies, and ticket status.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center" data-tour="tickets-filter-bar">
        {(["all", ...TICKET_STATUSES] as const).map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? "default" : "outline"}
            onClick={() => setStatusFilter(status)}
            className={`h-8 px-3 text-xs font-bold capitalize cursor-pointer ${
              statusFilter === status ? "bg-blue-600 text-white" : ""
            }`}
          >
            {status === "all" ? "All" : formatTicketStatusLabel(status)}
          </Button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSearchQuery(searchInput);
        }}
        className="flex gap-2 max-w-md"
      >
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by subject or email..."
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
          />
        </div>
        <Button type="submit" variant="outline" className="h-9 px-4 text-xs font-bold cursor-pointer">
          Search
        </Button>
      </form>

      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-800">Unable to load tickets</p>
            <p className="text-xs text-amber-700 mt-1 leading-relaxed">{error}</p>
            <p className="text-xs text-amber-600/80 mt-2">
              The ticket API may not be available yet. Once{" "}
              <code className="text-[10px] bg-amber-100 px-1 py-0.5 rounded">GET /api/v1/admin/tickets</code>{" "}
              is live, this page will populate automatically.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden" data-tour="tickets-list">
        {loading && tickets.length === 0 ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="text-xs">
              <TableHeader className="bg-slate-50">
                <TableRow className="border-b border-slate-100 hover:bg-transparent">
                  <TableHead className="p-4 pl-6 text-slate-400 font-bold uppercase tracking-wider text-[10px]">ID</TableHead>
                  <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Subject</TableHead>
                  <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Customer</TableHead>
                  <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Status</TableHead>
                  <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Priority</TableHead>
                  <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Updated</TableHead>
                  <TableHead className="p-4 pr-6 text-right text-slate-400 font-bold uppercase tracking-wider text-[10px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id} className="hover:bg-slate-50/50 border-b border-slate-100">
                    <TableCell className="p-4 pl-6 font-mono text-slate-500">#{ticket.id}</TableCell>
                    <TableCell className="p-4 font-bold text-slate-800 max-w-[200px] truncate">{ticket.subject}</TableCell>
                    <TableCell className="p-4 text-slate-500">
                      <div className="font-semibold text-slate-700">{ticket.customer_name || "—"}</div>
                      <div className="text-[11px] text-slate-400">{ticket.customer_email || ticket.customer_id || "—"}</div>
                    </TableCell>
                    <TableCell className="p-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-bold ${statusBadge(ticket.status)}`}>
                        {formatTicketStatusLabel(ticket.status)}
                      </span>
                    </TableCell>
                    <TableCell className="p-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${priorityBadge(ticket.priority)}`}>
                        {ticket.priority || "medium"}
                      </span>
                    </TableCell>
                    <TableCell className="p-4 text-slate-400">{formatDate(ticket.updated_at)}</TableCell>
                    <TableCell className="p-4 pr-6 text-right">
                      <Button
                        onClick={() => handleOpen(ticket.id)}
                        variant="ghost"
                        className="h-8 px-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {tickets.length === 0 && !loading && !error && (
                  <TableRow>
                    <TableCell colSpan={7} className="p-12 text-center">
                      <Ticket className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-400 font-medium">No tickets found</p>
                      <p className="text-xs text-slate-400 mt-1">Tickets will appear here once customers submit support requests.</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog
        open={viewOpen}
        onOpenChange={(open) => {
          setViewOpen(open);
          if (!open) clearSelected();
        }}
      >
        <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-2xl max-h-[85vh] overflow-y-auto bg-white border border-slate-200 rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Ticket Details</DialogTitle>
          </DialogHeader>
          {detailsLoading || !selected ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="space-y-5 pt-2">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-bold text-slate-900">{selected.subject}</p>
                  <p className="text-xs text-slate-400 mt-1">Ticket #{selected.id} · Created {formatDate(selected.created_at)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={selected.status}
                    onValueChange={(val) => handleStatusChange(selected.id, val)}
                    disabled={processingId === selected.id}
                  >
                    <SelectTrigger className="w-[130px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TICKET_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {formatTicketStatusLabel(s)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Customer</p>
                  <p className="font-semibold text-slate-800 mt-1">{selected.customer_name || "—"}</p>
                  <p className="text-slate-500">{selected.customer_email || "—"}</p>
                  {selected.customer_id && (
                    <Link href="/users" className="text-blue-600 font-semibold underline underline-offset-2 mt-1 inline-block">
                      View in Users
                    </Link>
                  )}
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Priority</p>
                  <p className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${priorityBadge(selected.priority)}`}>
                    {selected.priority || "medium"}
                  </p>
                  {selected.assigned_to && (
                    <p className="text-slate-500 mt-2">Assigned: {selected.assigned_to}</p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400 mb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" /> Conversation
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 p-3">
                  {(selected.messages || []).length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">No messages yet.</p>
                  ) : (
                    (selected.messages || []).map((msg) => (
                      <div key={msg.id} className="rounded-lg bg-white border border-slate-100 p-3">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[11px] font-bold text-slate-700">
                            {msg.author_name || msg.author_role || "User"}
                          </span>
                          <span className="text-[10px] text-slate-400">{formatDate(msg.created_at)}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{msg.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <form onSubmit={handleReply} className="space-y-2">
                <label className="text-xs font-semibold text-slate-500">Reply to customer</label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 resize-none"
                  required
                />
                <Button
                  type="submit"
                  disabled={processingId === selected.id || !replyText.trim()}
                  className="bg-blue-600 text-white hover:bg-blue-700 font-bold text-xs h-9 cursor-pointer"
                >
                  {processingId === selected.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Send Reply"
                  )}
                </Button>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
