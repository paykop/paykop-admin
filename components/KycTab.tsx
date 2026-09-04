"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { useAdminKycStore } from "../store/useAdminKycStore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Loader2, Eye, Check, X, ShieldCheck, FileText, ExternalLink } from "lucide-react";
import { toast } from "./ui/toast";
import { safeExternalUrl } from "@/lib/safeExternalUrl";
import { getErrorMessage } from "../lib/errors";
import RoleAccessBanner from "./RoleAccessBanner";

const STATUS_FILTERS = ["all", "pending", "verified", "rejected", "draft"] as const;

export default function KycTab() {
  const { getToken } = useAuth();
  const {
    submissions,
    loading,
    statusFilter,
    setStatusFilter,
    fetchSubmissions,
    selected,
    detailsLoading,
    fetchDetail,
    approve,
    reject,
    clearSelected,
    error,
  } = useAdminKycStore();

  const [viewOpen, setViewOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [rejectTargetId, setRejectTargetId] = useState<number | null>(null);

  useEffect(() => {
    fetchSubmissions(getToken, 1, 20, statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getToken, statusFilter]);

  const handleOpen = async (id: number) => {
    setViewOpen(true);
    await fetchDetail(getToken, id);
  };

  const handleApprove = async (id: number) => {
    if (!confirm("Approve this KYC submission?")) return;
    setProcessingId(id);
    try {
      await approve(getToken, id);
      toast.success("KYC submission approved.");
      setViewOpen(false);
      clearSelected();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to approve KYC."));
    } finally {
      setProcessingId(null);
    }
  };

  const openReject = (id: number) => {
    setRejectTargetId(id);
    setRejectReason("");
    setRejectOpen(true);
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectTargetId || !rejectReason.trim()) return;
    setProcessingId(rejectTargetId);
    try {
      await reject(getToken, rejectTargetId, rejectReason.trim());
      toast.success("KYC submission rejected.");
      setRejectOpen(false);
      setViewOpen(false);
      clearSelected();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to reject KYC."));
    } finally {
      setProcessingId(null);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
      rejected: "bg-rose-50 text-rose-600 border-rose-200",
      draft: "bg-slate-100 text-slate-600 border-slate-200",
    };
    return map[status] || "bg-slate-100 text-slate-600 border-slate-200";
  };

  const sellerDisplayName = (s: {
    seller_name?: string | null;
    first_name?: string | null;
    last_name?: string | null;
  }) => {
    const fromParts = `${s.first_name || ""} ${s.last_name || ""}`.trim();
    return (s.seller_name || "").trim() || fromParts || "—";
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const submittedLabel = (status: string, submittedAt?: string | null) => {
    if (submittedAt) return formatDate(submittedAt);
    if (status === "draft") return "Not submitted";
    return "—";
  };

  return (
    <div className="space-y-6">
      <RoleAccessBanner />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Seller KYC</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Review submissions after sellers submit for review. Draft uploads appear under the Draft filter until they call submit in the app.
          </p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition capitalize cursor-pointer ${
              statusFilter === status
                ? "bg-blue-500/10 border border-blue-500/20 text-blue-600"
                : "bg-slate-100 hover:bg-slate-200 text-slate-600"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading && submissions.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center gap-2">
            <ShieldCheck className="w-10 h-10 text-slate-300" />
            <p className="text-slate-800 font-bold text-sm">No KYC submissions</p>
            <p className="text-slate-500 text-xs max-w-sm">
              Sellers must submit after uploading documents before approve/reject is available. Check the Draft filter if uploads may still be in progress.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="text-xs">
              <TableHeader className="bg-slate-50">
                <TableRow className="border-b border-slate-100 hover:bg-transparent">
                  <TableHead className="p-4 pl-6 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Seller</TableHead>
                  <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Kind</TableHead>
                  <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">GSTIN / PAN</TableHead>
                  <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Status</TableHead>
                  <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Submitted</TableHead>
                  <TableHead className="p-4 pr-6 text-right text-slate-400 font-bold uppercase tracking-wider text-[10px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {submissions.map((s) => (
                  <TableRow key={s.id} className="hover:bg-slate-50/50 border-b border-slate-100">
                    <TableCell className="p-4 pl-6">
                      <div className="font-semibold text-slate-800">{sellerDisplayName(s)}</div>
                      <div className="font-mono text-[10px] text-slate-400 mt-0.5">{s.seller_user_id}</div>
                      <div className="text-[10px] text-slate-400">ID: {s.id}</div>
                    </TableCell>
                    <TableCell className="p-4 capitalize font-semibold text-slate-600">
                      {s.category_kind || "—"}
                    </TableCell>
                    <TableCell className="p-4 text-slate-600">
                      <div className="font-mono text-[10px]">{s.gstin || "—"}</div>
                      <div className="font-mono text-[10px] text-slate-400">{s.pan || "—"}</div>
                    </TableCell>
                    <TableCell className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex w-fit px-2 py-0.5 rounded-full border text-[10px] font-bold capitalize ${statusBadge(s.status)}`}>
                          {s.status}
                        </span>
                        {s.status === "draft" && (
                          <span className="text-[10px] text-slate-400">Not submitted by seller yet</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="p-4 text-slate-500">
                      {submittedLabel(s.status, s.submitted_at)}
                    </TableCell>
                    <TableCell className="p-4 pr-6 text-right">
                      {processingId === s.id ? (
                        <Loader2 className="w-4 h-4 animate-spin inline-block text-blue-500" />
                      ) : (
                        <div className="flex justify-end gap-2 flex-wrap items-center">
                          <Button
                            onClick={() => handleOpen(s.id)}
                            variant="outline"
                            className="h-7 px-2 rounded border border-slate-200 text-slate-600 text-[10px] cursor-pointer"
                          >
                            <Eye className="w-3 h-3 mr-1" /> View
                          </Button>
                          {s.status === "pending" && (
                            <>
                              <Button
                                onClick={() => handleApprove(s.id)}
                                variant="outline"
                                className="h-7 px-2 rounded border border-emerald-200 text-emerald-600 text-[10px] cursor-pointer"
                              >
                                <Check className="w-3 h-3 mr-1" /> Approve
                              </Button>
                              <Button
                                onClick={() => openReject(s.id)}
                                variant="outline"
                                className="h-7 px-2 rounded border border-rose-200 text-rose-600 text-[10px] cursor-pointer"
                              >
                                <X className="w-3 h-3 mr-1" /> Reject
                              </Button>
                            </>
                          )}
                          {s.status === "draft" && (
                            <span className="text-[10px] text-slate-400 self-center">Awaiting submit</span>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
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
            <DialogTitle className="text-base font-bold">KYC Submission Detail</DialogTitle>
          </DialogHeader>
          {detailsLoading || !selected ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="space-y-4 text-xs pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Seller</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{sellerDisplayName(selected)}</p>
                  <p className="font-mono text-[10px] text-slate-400 mt-0.5">{selected.seller_user_id}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Status</p>
                  <span className={`inline-flex mt-1 px-2 py-0.5 rounded-full border text-[10px] font-bold capitalize ${statusBadge(selected.status)}`}>
                    {selected.status}
                  </span>
                  {selected.status === "draft" && (
                    <p className="text-[10px] text-slate-400 mt-1">
                      Documents uploaded but not submitted for review. Ask the seller to tap Submit in the app, then approve here when status becomes pending.
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Submitted</p>
                  <p className="mt-0.5 text-slate-700">{submittedLabel(selected.status, selected.submitted_at)}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">GSTIN</p>
                  <p className="font-mono mt-0.5">{selected.gstin || "—"}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">PAN</p>
                  <p className="font-mono mt-0.5">{selected.pan || "—"}</p>
                </div>
              </div>

              {selected.rejection_reason && (
                <div className="rounded-lg bg-rose-50 border border-rose-100 p-3 text-rose-700">
                  <p className="font-bold text-[10px] uppercase mb-1">Rejection reason</p>
                  {selected.rejection_reason}
                </div>
              )}

              <div>
                <p className="text-slate-400 font-bold uppercase text-[10px] mb-2">Documents</p>
                <div className="space-y-2">
                  {(selected.documents || []).length === 0 ? (
                    <p className="text-slate-400">No documents attached.</p>
                  ) : (
                    selected.documents.map((doc, i) => {
                      const safeHref = safeExternalUrl(doc.file_url);
                      const content = (
                        <>
                          <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-800 capitalize truncate">{doc.doc_type.replace(/_/g, " ")}</p>
                            <p className="text-[10px] text-slate-400 truncate">{doc.content_type || doc.file_key}</p>
                          </div>
                          {safeHref ? (
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          ) : (
                            <span className="text-[10px] text-rose-500 font-semibold shrink-0">Unavailable</span>
                          )}
                        </>
                      );
                      if (!safeHref) {
                        return (
                          <div
                            key={`${doc.file_key || doc.file_url}-${i}`}
                            className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50 text-slate-500"
                            title="Unsafe or missing document URL"
                          >
                            {content}
                          </div>
                        );
                      }
                      return (
                        <a
                          key={`${doc.file_key || doc.file_url}-${i}`}
                          href={safeHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition"
                        >
                          {content}
                        </a>
                      );
                    })
                  )}
                </div>
              </div>

              {selected.status === "pending" && (
                <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
                  <Button
                    onClick={() => handleApprove(selected.id)}
                    disabled={processingId === selected.id}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 px-4 rounded-xl text-xs cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" /> Approve
                  </Button>
                  <Button
                    onClick={() => openReject(selected.id)}
                    variant="outline"
                    className="border-rose-200 text-rose-600 font-bold h-9 px-4 rounded-xl text-xs cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5 mr-1" /> Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-md max-h-[85vh] overflow-y-auto bg-white border border-slate-200 rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Reject KYC Submission</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleReject} className="space-y-3 pt-2 text-xs">
            <label className="block font-semibold text-slate-500 uppercase tracking-wider">
              Reason (required)
            </label>
            <textarea
              required
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Explain what the seller must fix…"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-blue-500"
            />
            <Button
              type="submit"
              disabled={processingId !== null || !rejectReason.trim()}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold h-9 rounded-xl cursor-pointer"
            >
              {processingId !== null ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Reject"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
