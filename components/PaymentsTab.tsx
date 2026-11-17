"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { useUserStore } from "../store/useUserStore";
import { isAdmin } from "@/lib/rbac";
import { useAdminPaymentsStore } from "../store/useAdminPaymentsStore";
import { Card, CardContent } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "./ui/toast";
import { getErrorMessage } from "../lib/errors";

const PAYMENT_STATUSES = [
  "all",
  "pending",
  "succeeded",
  "failed",
  "refunded",
  "partially_refunded",
  "unknown_timeout",
] as const;

type Panel = "payments" | "report";

export default function PaymentsTab() {
  const { getToken } = useAuth();
  const backendUser = useUserStore((s) => s.backendUser);
  const canRefund = isAdmin(backendUser?.role);

  const {
    payments,
    total,
    loading,
    error,
    transactions,
    totalAmount,
    reportCount,
    reportLoading,
    fetchAdminPayments,
    processPaymentRefund,
    fetchAdminTransactionReport,
  } = useAdminPaymentsStore();

  const [panel, setPanel] = useState<Panel>("payments");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const limit = 20;

  useEffect(() => {
    if (panel === "payments") {
      fetchAdminPayments(
        getToken,
        page,
        limit,
        statusFilter === "all" ? undefined : statusFilter
      );
    } else {
      fetchAdminTransactionReport(getToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getToken, panel, page, statusFilter]);

  const handleRefund = async (id: number) => {
    if (!canRefund) return;
    if (!confirm("Process a full refund for this payment?")) return;
    setProcessingId(id);
    try {
      await processPaymentRefund(getToken, id);
      toast.success("Refund processed.");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Refund failed."));
    } finally {
      setProcessingId(null);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      succeeded: "bg-emerald-50 text-emerald-600 border-emerald-200",
      pending: "bg-amber-50 text-amber-600 border-amber-200",
      failed: "bg-rose-50 text-rose-600 border-rose-200",
      refunded: "bg-slate-100 text-slate-500 border-slate-200",
      partially_refunded: "bg-indigo-50 text-indigo-600 border-indigo-200",
      unknown_timeout: "bg-orange-50 text-orange-600 border-orange-200",
    };
    return map[status] || "bg-slate-100 text-slate-600 border-slate-200";
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const isLoading = panel === "payments" ? loading : reportLoading;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Payments</h2>
          <p className="text-sm text-slate-500 mt-0.5">Transaction history, refunds & reports</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setPanel("payments")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
              panel === "payments" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
            }`}
          >
            Payments
          </button>
          <button
            onClick={() => setPanel("report")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
              panel === "report" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
            }`}
          >
            Report
          </button>
        </div>
      </div>

      {panel === "report" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
            <CardContent className="p-5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total amount</span>
              <p className="text-3xl font-bold text-slate-900 tracking-tight mt-2">
                ₹{(totalAmount / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
            <CardContent className="p-5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Transactions</span>
              <p className="text-3xl font-bold text-slate-900 tracking-tight mt-2">{reportCount}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {panel === "payments" && (
        <div className="flex gap-2 flex-wrap">
          {PAYMENT_STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize cursor-pointer ${
                statusFilter === status
                  ? "bg-blue-500/10 border border-blue-500/20 text-blue-600"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              {status.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600 flex items-center justify-between gap-2">
          <span>{error}</span>
          <Button
            variant="outline"
            className="h-7 px-2 text-[10px] cursor-pointer"
            onClick={() =>
              panel === "payments"
                ? fetchAdminPayments(getToken, page, limit, statusFilter === "all" ? undefined : statusFilter)
                : fetchAdminTransactionReport(getToken)
            }
          >
            <RefreshCw className="w-3 h-3 mr-1" /> Retry
          </Button>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {isLoading && (panel === "payments" ? payments.length === 0 : transactions.length === 0) ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : panel === "payments" ? (
          payments.length === 0 ? (
            <div className="p-10 text-center text-slate-500 text-sm">No payments found.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="text-xs">
                <TableHeader className="bg-slate-50">
                  <TableRow className="border-b border-slate-100 hover:bg-transparent">
                    <TableHead className="p-4 pl-6 text-slate-400 font-bold uppercase tracking-wider text-[10px]">ID</TableHead>
                    <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Amount</TableHead>
                    <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Provider</TableHead>
                    <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Status</TableHead>
                    <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Created</TableHead>
                    <TableHead className="p-4 pr-6 text-right text-slate-400 font-bold uppercase tracking-wider text-[10px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-100">
                  {payments.map((p) => (
                    <TableRow key={p.id} className="hover:bg-slate-50/50 border-b border-slate-100">
                      <TableCell className="p-4 pl-6 font-mono text-[11px] text-slate-700">
                        #{p.id}
                        {p.order_id != null && (
                          <div className="text-[10px] text-slate-400">Order {p.order_id}</div>
                        )}
                      </TableCell>
                      <TableCell className="p-4 font-bold text-slate-900">
                        ₹{(p.amount / 100).toFixed(2)}
                        <span className="text-[10px] text-slate-400 ml-1">{p.currency}</span>
                      </TableCell>
                      <TableCell className="p-4 text-slate-600 capitalize">{p.provider || "—"}</TableCell>
                      <TableCell className="p-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-bold capitalize ${statusBadge(p.status)}`}>
                          {p.status.replace(/_/g, " ")}
                        </span>
                      </TableCell>
                      <TableCell className="p-4 text-slate-500">
                        {p.created_at ? new Date(p.created_at).toLocaleString("en-IN") : "—"}
                      </TableCell>
                      <TableCell className="p-4 pr-6 text-right">
                        {canRefund && p.status === "succeeded" ? (
                          processingId === p.id ? (
                            <Loader2 className="w-4 h-4 animate-spin inline-block text-blue-500" />
                          ) : (
                            <Button
                              onClick={() => handleRefund(p.id)}
                              variant="outline"
                              className="h-7 px-2 rounded border border-amber-200 text-amber-600 text-[10px] font-bold cursor-pointer"
                            >
                              Refund
                            </Button>
                          )
                        ) : (
                          <span className="text-[10px] text-slate-400">{canRefund ? "—" : "Admin only"}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )
        ) : transactions.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-sm">No transactions in report.</div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="text-xs">
              <TableHeader className="bg-slate-50">
                <TableRow className="border-b border-slate-100 hover:bg-transparent">
                  <TableHead className="p-4 pl-6 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Payment</TableHead>
                  <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Buyer / Seller</TableHead>
                  <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Amount</TableHead>
                  <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Status</TableHead>
                  <TableHead className="p-4 pr-6 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {transactions.map((t) => (
                  <TableRow key={`${t.payment_id}-${t.created_at}`} className="hover:bg-slate-50/50 border-b border-slate-100">
                    <TableCell className="p-4 pl-6 font-mono text-[11px]">#{t.payment_id}</TableCell>
                    <TableCell className="p-4 text-[10px] font-mono text-slate-500">
                      <div>{t.buyer_id || "—"}</div>
                      <div>{t.seller_id || "—"}</div>
                    </TableCell>
                    <TableCell className="p-4 font-bold">₹{(t.amount / 100).toFixed(2)}</TableCell>
                    <TableCell className="p-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-bold capitalize ${statusBadge(t.status)}`}>
                        {t.status}
                      </span>
                    </TableCell>
                    <TableCell className="p-4 pr-6 text-slate-500">
                      {new Date(t.created_at).toLocaleString("en-IN")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {panel === "payments" && totalPages > 1 && (
        <div className="flex flex-wrap justify-between items-center gap-3 bg-white border border-slate-200 px-4 md:px-6 py-3.5 rounded-2xl shadow-sm text-xs">
          <span className="text-slate-500 font-semibold">
            Page {page} of {totalPages} ({total} total)
          </span>
          <div className="flex gap-2">
            <Button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              variant="outline"
              className="h-8 px-3 rounded-lg cursor-pointer disabled:opacity-50"
            >
              Previous
            </Button>
            <Button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              variant="outline"
              className="h-8 px-3 rounded-lg cursor-pointer disabled:opacity-50"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
