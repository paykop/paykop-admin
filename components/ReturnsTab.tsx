// src/components/ReturnsTab.tsx
"use client";

import React, { useState, useEffect } from "react";
import SafeImage from "./SafeImage";
import { useAuth } from "@/lib/useAuth";
import { useUserStore } from "../store/useUserStore";
import { isAdmin } from "@/lib/rbac";
import { useAdminReturnsStore } from "../store/useAdminReturnsStore";
import { ReturnItem, AdminResolveInput } from "../schemas/returnSchema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import {
  RotateCcw,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Sprout,
  ShoppingBag,
  IndianRupee,
  ShieldAlert,
  FileText,
  ImageIcon,
} from "lucide-react";
import { toast } from "./ui/toast";
import { getErrorMessage } from "../lib/errors";

const RETURN_STATUSES = [
  "all",
  "requested",
  "approved",
  "rejected",
  "received",
  "completed",
  "escalated",
  "cancelled",
] as const;

export default function ReturnsTab() {
  const { getToken } = useAuth();
  const backendUser = useUserStore((s) => s.backendUser);
  const canResolve = isAdmin(backendUser?.role);

  const {
    returns,
    total,
    page,
    statusFilter,
    verticalFilter,
    selectedReturn,
    loading,
    resolving,
    error,
    setStatusFilter,
    setVerticalFilter,
    setPage,
    selectReturn,
    fetchReturns,
    resolveReturnAction,
  } = useAdminReturnsStore();

  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [resolveDecision, setResolveDecision] = useState<"refund" | "replacement" | "reject">("refund");
  const [resolveNote, setResolveNote] = useState("");
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  useEffect(() => {
    fetchReturns(getToken, page, statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getToken, page, statusFilter]);

  const filteredReturns =
    verticalFilter === "all"
      ? returns
      : returns.filter((r) => (r.vertical || "paykop") === verticalFilter);

  const escalatedCount = returns.filter((r) => r.status === "escalated").length;
  const requestedCount = returns.filter((r) => r.status === "requested").length;
  const completedCount = returns.filter((r) => r.status === "completed").length;

  const handleOpenInspect = (item: ReturnItem) => {
    selectReturn(item);
    setResolveDecision("refund");
    setResolveNote("");
    setActivePhoto(item.attachments && item.attachments.length > 0 ? item.attachments[0].file_url : null);
    setInspectModalOpen(true);
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReturn) return;
    if (!resolveNote.trim()) {
      toast.error("A resolution note explaining the administrative decision is required.");
      return;
    }

    try {
      const payload: AdminResolveInput = {
        decision: resolveDecision,
        note: resolveNote.trim(),
      };
      await resolveReturnAction(getToken, selectedReturn.id, payload);
      toast.success(
        resolveDecision === "refund"
          ? "Dispute resolved with buyer refund issued."
          : resolveDecision === "replacement"
          ? "Dispute resolved with replacement authorized."
          : "Dispute resolved with return rejected."
      );
      setInspectModalOpen(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to resolve return dispute"));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "escalated":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-300 animate-pulse">
            <AlertTriangle className="w-3 h-3 text-amber-600" /> Escalated Dispute
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Completed
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3 h-3 text-blue-600" /> Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" /> Rejected
          </span>
        );
      case "received":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Clock className="w-3 h-3 text-purple-600" /> Received by Seller
          </span>
        );
      case "requested":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
            <Clock className="w-3 h-3 text-sky-600" /> Requested
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 capitalize">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <RotateCcw className="w-6 h-6 text-blue-600" /> Returns & Dispute Resolution
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Oversee return requests, inspect proof attachments, and resolve merchant disputes across retail and fresh produce.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Returns</div>
          <div className="text-2xl font-extrabold text-slate-800 mt-1">{total}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-sm">
          <div className="text-[11px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Escalated Disputes
          </div>
          <div className="text-2xl font-extrabold text-amber-700 mt-1">{escalatedCount}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-sky-200 shadow-sm">
          <div className="text-[11px] font-bold text-sky-600 uppercase tracking-wider">Pending Review</div>
          <div className="text-2xl font-extrabold text-sky-700 mt-1">{requestedCount}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm">
          <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Completed / Settled</div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">{completedCount}</div>
        </div>
      </div>

      {/* Filters: Status & Vertical */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between flex-wrap">
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-xs font-semibold text-slate-400 mr-1">Status:</span>
          {RETURN_STATUSES.map((status) => {
            const isActive = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer capitalize ${
                  isActive
                    ? "bg-blue-500/10 border border-blue-500/20 text-blue-600 font-extrabold"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600 border border-transparent"
                }`}
              >
                {status}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-xs font-semibold text-slate-400 mr-1">Vertical:</span>
          {(["all", "paykop", "farm"] as const).map((vert) => {
            const isActive = verticalFilter === vert;
            return (
              <button
                key={vert}
                onClick={() => setVerticalFilter(vert)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer capitalize ${
                  isActive
                    ? vert === "farm"
                      ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 font-extrabold"
                      : "bg-blue-500/10 border border-blue-500/30 text-blue-600 font-extrabold"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600 border border-transparent"
                }`}
              >
                {vert === "farm" && <Sprout className="w-3.5 h-3.5 text-emerald-600" />}
                {vert === "paykop" && <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />}
                {vert === "all" ? "All" : vert === "paykop" ? "Paykop" : "Farm"}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading && filteredReturns.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : filteredReturns.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
            <RotateCcw className="w-10 h-10 text-slate-300" />
            <p className="text-slate-800 font-bold text-sm">No return requests found</p>
            <p className="text-xs text-slate-400">
              There are no returns matching status &quot;{statusFilter}&quot; and vertical &quot;{verticalFilter}&quot;.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="text-xs">
              <TableHeader className="bg-slate-50">
                <TableRow className="border-b border-slate-100 hover:bg-transparent">
                  <TableHead className="p-4 pl-6 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Return ID & Order</TableHead>
                  <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Vertical</TableHead>
                  <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Reason & Resolution</TableHead>
                  <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Refund Amount</TableHead>
                  <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Status</TableHead>
                  <TableHead className="p-4 pr-6 text-right text-slate-400 font-bold uppercase tracking-wider text-[10px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {filteredReturns.map((item) => {
                  const isFarm = item.vertical === "farm";
                  return (
                    <TableRow key={item.id} className="hover:bg-slate-50/50 transition border-b border-slate-100">
                      <TableCell className="p-4 pl-6">
                        <div className="font-bold text-slate-800 text-[13px]">Return #{item.id}</div>
                        <div className="text-[10px] text-slate-400">
                          Order #{item.order_id} · {new Date(item.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          Buyer: {item.buyer_id.slice(0, 12)}...
                        </div>
                      </TableCell>

                      <TableCell className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            isFarm
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          {isFarm ? <Sprout className="w-3 h-3 text-emerald-600" /> : <ShoppingBag className="w-3 h-3 text-blue-600" />}
                          {isFarm ? "Farm Produce" : "Paykop"}
                        </span>
                      </TableCell>

                      <TableCell className="p-4">
                        <div className="font-semibold text-slate-800 capitalize">
                          {item.reason_code.replace(/_/g, " ")}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="capitalize font-bold text-indigo-600">{item.resolution}</span>
                          <span>·</span>
                          <span>
                            Qty: {isFarm && item.quantity_milli ? `${item.quantity_milli / 1000} kg` : `${item.quantity} units`}
                          </span>
                        </div>
                        {item.reason_text && (
                          <div className="text-[11px] text-slate-500 italic truncate max-w-xs mt-0.5">
                            &quot;{item.reason_text}&quot;
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="p-4">
                        <div className="text-slate-800 font-bold flex items-center gap-0.5">
                          <IndianRupee className="w-3 h-3" />
                          {(item.refund_amount_paise / 100).toFixed(2)}
                        </div>
                        {item.payment_id && (
                          <div className="text-[10px] text-slate-400">Payment ID: {item.payment_id}</div>
                        )}
                      </TableCell>

                      <TableCell className="p-4">
                        {getStatusBadge(item.status)}
                      </TableCell>

                      <TableCell className="p-4 pr-6 text-right">
                        <Button
                          onClick={() => handleOpenInspect(item)}
                          variant="outline"
                          className="h-8 px-3 rounded-lg border border-blue-200 hover:bg-blue-50 text-blue-600 text-xs inline-flex items-center gap-1.5 cursor-pointer font-bold"
                        >
                          <Eye className="w-3.5 h-3.5" /> Inspect
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Detail & Resolution Modal */}
      <Dialog open={inspectModalOpen} onOpenChange={setInspectModalOpen}>
        <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
          {selectedReturn && (
            <div>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <RotateCcw className="w-5 h-5 text-blue-600" /> Return Dispute #{selectedReturn.id}
                  </DialogTitle>
                  <div>{getStatusBadge(selectedReturn.status)}</div>
                </div>
              </DialogHeader>

              <div className="py-4 space-y-4 text-xs">
                {/* Meta details grid */}
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 font-medium">Order ID:</span>
                    <span className="ml-2 font-bold text-slate-800">#{selectedReturn.order_id}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Vertical Domain:</span>
                    <span className="ml-2 font-bold capitalize text-slate-800">{selectedReturn.vertical}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Requested Resolution:</span>
                    <span className="ml-2 font-bold capitalize text-indigo-600">{selectedReturn.resolution}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Refund Amount:</span>
                    <span className="ml-2 font-bold text-slate-800">₹{(selectedReturn.refund_amount_paise / 100).toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Buyer ID:</span>
                    <span className="ml-2 font-mono text-[11px] text-slate-700">{selectedReturn.buyer_id}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Seller ID:</span>
                    <span className="ml-2 font-mono text-[11px] text-slate-700">{selectedReturn.seller_id}</span>
                  </div>
                </div>

                {/* Return Reason & Notes */}
                <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" /> Reason & Buyer Statement
                  </div>
                  <div className="font-semibold text-slate-800 text-sm">
                    {selectedReturn.reason_code.replace(/_/g, " ")}
                  </div>
                  {selectedReturn.reason_text && (
                    <p className="text-slate-600 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      &quot;{selectedReturn.reason_text}&quot;
                    </p>
                  )}
                </div>

                {/* Seller Inspection details */}
                {selectedReturn.inspection_note && (
                  <div className="space-y-1 bg-amber-50/50 p-3 rounded-xl border border-amber-200 text-amber-900">
                    <div className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600" /> Seller Inspection Feedback
                    </div>
                    <p className="text-xs">{selectedReturn.inspection_note}</p>
                  </div>
                )}

                {/* Proof Photos Lightbox */}
                {selectedReturn.attachments && selectedReturn.attachments.length > 0 ? (
                  <div className="space-y-2 border-t border-slate-100 pt-3">
                    <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-indigo-600" /> Photo Attachments ({selectedReturn.attachments.length})
                    </div>
                    <div className="flex gap-2 overflow-x-auto py-1">
                      {selectedReturn.attachments.map((att) => (
                        <button
                          type="button"
                          key={att.id}
                          onClick={() => setActivePhoto(att.file_url)}
                          className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 cursor-pointer transition ${
                            activePhoto === att.file_url ? "border-blue-500 shadow-sm" : "border-slate-200 opacity-80"
                          }`}
                        >
                          <SafeImage
                            src={att.file_url}
                            alt="Attachment"
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>

                    {activePhoto && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 flex justify-center max-h-60">
                        <SafeImage
                          src={activePhoto}
                          alt="Active Attachment Preview"
                          width={480}
                          height={240}
                          className="max-h-60 w-auto object-contain"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-slate-400 italic text-[11px] text-center py-2 bg-slate-50 rounded-lg">
                    No photo proof attached by buyer.
                  </div>
                )}

                {/* Previous Resolution Note if any */}
                {selectedReturn.decision_note && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Decision Note (Decided by: {selectedReturn.decided_by || "Admin"})
                    </div>
                    <p className="text-xs text-slate-700">{selectedReturn.decision_note}</p>
                  </div>
                )}

                {/* Administrative Dispute Resolution Form (Admin only) */}
                {canResolve && (selectedReturn.status === "escalated" || selectedReturn.status === "requested") && (
                  <form onSubmit={handleResolveSubmit} className="border-t border-slate-200 pt-4 space-y-3">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" /> Administrative Dispute Resolution
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setResolveDecision("refund")}
                        className={`p-2.5 rounded-lg border text-xs font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition ${
                          resolveDecision === "refund"
                            ? "bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500/20"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Issue Refund</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setResolveDecision("replacement")}
                        className={`p-2.5 rounded-lg border text-xs font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition ${
                          resolveDecision === "replacement"
                            ? "bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-500/20"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <RotateCcw className="w-4 h-4 text-blue-600" />
                        <span>Approve Replace</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setResolveDecision("reject")}
                        className={`p-2.5 rounded-lg border text-xs font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition ${
                          resolveDecision === "reject"
                            ? "bg-rose-50 border-rose-500 text-rose-700 ring-2 ring-rose-500/20"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <XCircle className="w-4 h-4 text-rose-600" />
                        <span>Reject Claim</span>
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Resolution Explanation Note *</label>
                      <textarea
                        required
                        rows={3}
                        value={resolveNote}
                        onChange={(e) => setResolveNote(e.target.value)}
                        placeholder="State clear reasons for the resolution (e.g. photos confirm transit damage; initiating automated refund to buyer)."
                        className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setInspectModalOpen(false)}
                        className="rounded-lg h-9"
                      >
                        Close
                      </Button>
                      <Button
                        type="submit"
                        disabled={resolving}
                        className={`rounded-lg h-9 text-white font-bold cursor-pointer ${
                          resolveDecision === "refund"
                            ? "bg-emerald-600 hover:bg-emerald-700"
                            : resolveDecision === "replacement"
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-rose-600 hover:bg-rose-700"
                        }`}
                      >
                        {resolving ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-1" />
                        ) : null}
                        Confirm {resolveDecision.toUpperCase()}
                      </Button>
                    </div>
                  </form>
                )}
              </div>

              {(!canResolve || (selectedReturn.status !== "escalated" && selectedReturn.status !== "requested")) && (
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setInspectModalOpen(false)}
                    className="rounded-lg h-9"
                  >
                    Close
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
