"use client";

import React, { useEffect, useState } from "react";
import {
  Banknote,
  CheckCircle2,
  Clock,
  Building2,
  Loader2,
  AlertCircle,
  X,
  Plus,
  ArrowRight,
  ShieldCheck,
  Send,
  Eye,
} from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import {
  fetchAdminPayouts,
  previewOrgPayout,
  runOrgPayoutBatch,
  approveAdminPayout,
} from "../services/payoutService";
import { fetchOrganizations } from "../services/organizationService";
import { PayoutItem, PayoutPreviewResponse } from "../schemas/payoutSchema";
import { Organization } from "../schemas/organizationSchema";

export default function PayoutsTab() {
  const { getToken } = useAuth();
  const [payouts, setPayouts] = useState<PayoutItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<"all" | "pending" | "completed">("all");

  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [runModalOpen, setRunModalOpen] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [previewData, setPreviewData] = useState<PayoutPreviewResponse | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [batchSubmitting, setBatchSubmitting] = useState(false);

  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [targetPayout, setTargetPayout] = useState<PayoutItem | null>(null);
  const [approving, setApproving] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const loadPayouts = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetchAdminPayouts(token, {
        page,
        limit: 20,
        status: activeFilter === "all" ? undefined : activeFilter,
      });
      setPayouts(res.payouts || []);
      setTotal(res.total || 0);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to load payouts ledger");
    } finally {
      setLoading(false);
    }
  };

  const loadOrganizations = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetchOrganizations(token, 1, 100, "verified");
      setOrgs(res.organizations || []);
      if (res.organizations && res.organizations.length > 0) {
        setSelectedOrgId(res.organizations[0].id);
      }
    } catch (err) {
      console.error("Failed to load organizations for payouts:", err);
    }
  };

  useEffect(() => {
    loadPayouts();
  }, [page, activeFilter]);

  useEffect(() => {
    loadOrganizations();
    // Default period: past 30 days
    const now = new Date();
    const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    setPeriodStart(past.toISOString().split("T")[0]);
    setPeriodEnd(now.toISOString().split("T")[0]);
  }, []);

  const handlePreview = async () => {
    if (!selectedOrgId || !periodStart || !periodEnd) {
      setErrorMsg("Please select an organization and date range");
      return;
    }
    setPreviewLoading(true);
    setErrorMsg("");
    try {
      const token = await getToken();
      if (!token) return;
      const startISO = new Date(periodStart).toISOString();
      const endISO = new Date(`${periodEnd}T23:59:59Z`).toISOString();
      const preview = await previewOrgPayout(token, selectedOrgId, startISO, endISO);
      setPreviewData(preview);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to preview payout batch");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleRunBatch = async () => {
    if (!selectedOrgId || !periodStart || !periodEnd) return;
    setBatchSubmitting(true);
    setErrorMsg("");
    try {
      const token = await getToken();
      if (!token) return;
      const startISO = new Date(periodStart).toISOString();
      const endISO = new Date(`${periodEnd}T23:59:59Z`).toISOString();
      await runOrgPayoutBatch(token, selectedOrgId, startISO, endISO);
      setSuccessMsg("Payout batch created successfully in pending status.");
      setRunModalOpen(false);
      setPreviewData(null);
      loadPayouts();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to run payout batch");
    } finally {
      setBatchSubmitting(false);
    }
  };

  const handleConfirmApprove = async () => {
    if (!targetPayout) return;
    setApproving(true);
    setErrorMsg("");
    try {
      const token = await getToken();
      if (!token) return;
      await approveAdminPayout(token, targetPayout.id);
      setSuccessMsg("Payout settlement successfully approved via RazorpayX.");
      setApproveModalOpen(false);
      setTargetPayout(null);
      loadPayouts();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to approve payout");
    } finally {
      setApproving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Banknote className="w-6 h-6 text-emerald-600" />
            Organization Payout Settlements
          </h1>
          <p className="text-sm text-gray-500">
            Audit, initiate, and disburse batched RazorpayX settlement transfers to verified NGO bank accounts.
          </p>
        </div>

        <button
          onClick={() => {
            setRunModalOpen(true);
            setPreviewData(null);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Run Payout Batch
        </button>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg("")}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg("")}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => {
            setActiveFilter("all");
            setPage(1);
          }}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeFilter === "all" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All Batches
        </button>
        <button
          onClick={() => {
            setActiveFilter("pending");
            setPage(1);
          }}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeFilter === "pending"
              ? "bg-amber-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Pending Approval
        </button>
        <button
          onClick={() => {
            setActiveFilter("completed");
            setPage(1);
          }}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeFilter === "completed"
              ? "bg-emerald-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Completed / Settled
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-emerald-600" />
            Loading payout settlements...
          </div>
        ) : payouts.length === 0 ? (
          <div className="py-20 text-center text-gray-400 text-sm">
            No payout settlement batches found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-3">Batch ID / Organization</th>
                  <th className="px-6 py-3">Period</th>
                  <th className="px-6 py-3">Settlement Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">RazorpayX Reference</th>
                  <th className="px-6 py-3">Created</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payouts.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{item.org_name || "Organization"}</div>
                      <div className="font-mono text-[10px] text-gray-400">{item.id.slice(0, 16)}...</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <div>{new Date(item.period_start).toLocaleDateString("en-IN")}</div>
                      <div className="text-[10px] text-gray-400">
                        to {new Date(item.period_end).toLocaleDateString("en-IN")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-black text-gray-900 text-sm">
                        ₹{(item.amount_paise / 100).toLocaleString("en-IN")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          item.payout_status === "completed"
                            ? "bg-emerald-50 text-emerald-700"
                            : item.payout_status === "pending"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {item.payout_status === "completed" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {item.payout_status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-500">
                      {item.razorpayx_payout_id || "—"}
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {new Date(item.created_at).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {item.payout_status === "pending" && (
                        <button
                          onClick={() => {
                            setTargetPayout(item);
                            setApproveModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                        >
                          Approve Settlement
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Run Payout Batch Modal */}
      {runModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Banknote className="w-5 h-5 text-emerald-600" />
                Run Organization Payout Batch
              </h3>
              <button
                onClick={() => setRunModalOpen(false)}
                className="p-1 rounded-md text-gray-400 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-gray-700">Select Verified Organization</label>
                <select
                  value={selectedOrgId}
                  onChange={(e) => setSelectedOrgId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {orgs.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.legal_name} ({o.org_type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700">Period Start</label>
                  <input
                    type="date"
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-gray-700">Period End</label>
                  <input
                    type="date"
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handlePreview}
                disabled={previewLoading}
                className="w-full py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                {previewLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
                Calculate Settlement Preview
              </button>

              {/* Preview Results Box */}
              {previewData && (
                <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Eligible Online Donations:</span>
                    <span className="font-bold text-gray-900">{previewData.donation_count} gifts</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Gross Collected:</span>
                    <span className="font-bold text-gray-900">
                      ₹{previewData.gross_amount_inr.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Paykop Platform Fee (0%):</span>
                    <span className="font-semibold text-emerald-700">₹0.00</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-emerald-100">
                    <span className="font-bold text-gray-700">Net Settlement Amount:</span>
                    <span className="font-black text-emerald-800 text-sm">
                      ₹{previewData.net_amount_inr.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 pt-1">
                    Bank Destination: <span className="font-mono">{previewData.bank_account_masked}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setRunModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRunBatch}
                disabled={batchSubmitting || !previewData || previewData.donation_count === 0}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm disabled:opacity-50"
              >
                {batchSubmitting ? "Creating..." : "Confirm & Run Batch"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Payout Confirmation Modal */}
      {approveModalOpen && targetPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-100">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Approve Settlement Disbursement
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Are you sure you want to approve settlement for <strong>{targetPayout.org_name}</strong> in the
              amount of{" "}
              <strong>₹{(targetPayout.amount_paise / 100).toLocaleString("en-IN")}</strong>? This will execute
              the payout batch via the RazorpayX settlement gateway.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setApproveModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApprove}
                disabled={approving}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm disabled:opacity-50"
              >
                {approving ? "Approving..." : "Confirm & Disburse"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
