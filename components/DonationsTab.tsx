"use client";

import { useEffect, useState } from "react";
import {
  HeartHandshake,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Loader2,
  AlertCircle,
  X,
  CreditCard,
  Banknote,
} from "lucide-react";
import {
  fetchAdminDonations,
  confirmDonationReconciliation,
} from "../services/donationService";
import { DonationLedgerItem } from "../schemas/donationSchema";
import { safeExternalUrl } from "@/lib/safeExternalUrl";

export default function DonationsTab() {
  const [donations, setDonations] = useState<DonationLedgerItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<"all" | "online" | "pending_cash" | "reconciled">("all");
  const [refreshKey, setRefreshKey] = useState(0);

  const [selectedDonation, setSelectedDonation] = useState<DonationLedgerItem | null>(null);
  const [reconciling, setReconciling] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const depositProofHref = selectedDonation
    ? safeExternalUrl(selectedDonation.deposit_proof_url)
    : null;

  useEffect(() => {
    let ignore = false;
    let status: string | undefined;
    let method: string | undefined;
    let recon: string | undefined;

    if (activeFilter === "online") {
      method = "online";
      status = "captured";
    } else if (activeFilter === "pending_cash") {
      method = "cash";
      recon = "pending";
    } else if (activeFilter === "reconciled") {
      method = "cash";
      recon = "reconciled";
    }

    fetchAdminDonations(page, 20, status, method, recon)
      .then((res) => {
        if (!ignore) {
          setDonations(res.donations);
          setTotal(res.total);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          setErrorMsg(err instanceof Error ? err.message : "Failed to load donation ledger");
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [page, activeFilter, refreshKey]);

  const handleConfirmReconcile = async () => {
    if (!selectedDonation) return;
    setReconciling(true);
    setErrorMsg("");
    try {
      const updated = await confirmDonationReconciliation(selectedDonation.id);
      setSuccessMsg(`Donation of ₹${(updated.amount_paise / 100).toLocaleString("en-IN")} successfully reconciled!`);
      setSelectedDonation(null);
      setLoading(true);
      setRefreshKey((k) => k + 1);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to confirm reconciliation");
    } finally {
      setReconciling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <HeartHandshake className="w-7 h-7 text-pink-600" />
            Donation & Reconciliation Ledger
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Audit online gifts, verify field agent cash deposits, and oversee Section 80G receipts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-pink-50 text-pink-700 text-xs font-bold rounded-full border border-pink-200">
            Total Records: {total}
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
        {[
          { id: "all", label: "All Donations" },
          { id: "online", label: "Online Captured" },
          { id: "pending_cash", label: "Cash Awaiting Reconciliation" },
          { id: "reconciled", label: "Reconciled Cash" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveFilter(tab.id as typeof activeFilter);
              setPage(1);
              setLoading(true);
            }}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
              activeFilter === tab.id
                ? "bg-pink-600 text-white shadow-xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-xs text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs text-emerald-800">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 text-center space-y-2">
            <Loader2 className="w-8 h-8 text-pink-600 animate-spin mx-auto" />
            <p className="text-xs text-gray-500">Loading donation entries...</p>
          </div>
        ) : donations.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <HeartHandshake className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-sm font-semibold text-gray-700">No donations found</p>
            <p className="text-xs text-gray-400">There are no records matching the selected filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Date / ID</th>
                  <th className="py-3 px-4">Donor Details</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">80G Benefit</th>
                  <th className="py-3 px-4">Payment Status</th>
                  <th className="py-3 px-4">Reconciliation</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {donations.map((d) => {
                  const isPendingCash = d.payment_method === "cash" && d.reconciliation_status === "pending";

                  return (
                    <tr key={d.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[11px] text-gray-500">
                        <div>{new Date(d.created_at).toLocaleDateString("en-IN")}</div>
                        <div className="text-[10px] text-gray-400 truncate max-w-[120px]">{d.id}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900">{d.donor_name}</div>
                        <div className="text-gray-500 font-mono text-[11px]">{d.donor_phone_masked}</div>
                        {d.donor_email && <div className="text-[10px] text-gray-400">{d.donor_email}</div>}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-sm text-gray-900">
                        ₹{(d.amount_paise / 100).toLocaleString("en-IN")}
                      </td>

                      <td className="py-3.5 px-4">
                        {d.payment_method === "online" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px]">
                            <CreditCard className="w-3 h-3" />
                            Online
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-bold text-[10px]">
                            <Banknote className="w-3 h-3" />
                            Field Cash
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {d.tax_eligible ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                              <ShieldCheck className="w-3 h-3" />
                              80G Eligible
                            </span>
                            {d.donor_pan && (
                              <div className="font-mono text-[10px] text-gray-500 uppercase">{d.donor_pan}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-400 font-medium">Standard</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {d.payment_status === "captured" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            Captured
                          </span>
                        ) : d.payment_status === "pending" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                            Pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 font-bold text-[10px]">
                            Failed
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {d.reconciliation_status === "reconciled" ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Reconciled
                          </span>
                        ) : d.reconciliation_status === "pending" ? (
                          <span className="inline-flex items-center gap-1 text-amber-600 font-bold text-[11px]">
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            Awaiting Deposit
                          </span>
                        ) : (
                          <span className="text-gray-400 text-[11px]">N/A</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {isPendingCash ? (
                          <button
                            onClick={() => setSelectedDonation(d)}
                            className="px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                          >
                            Review & Reconcile
                          </button>
                        ) : (
                          <span className="text-[11px] text-gray-400 font-mono">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reconciliation Modal */}
      {selectedDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 space-y-5 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Banknote className="w-5 h-5 text-pink-600" />
                <h3 className="font-bold text-base text-gray-900">Reconcile Field Agent Cash Deposit</h3>
              </div>
              <button
                onClick={() => setSelectedDonation(null)}
                className="p-1 rounded-full text-gray-400 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Donor:</span>
                  <span className="font-bold text-gray-900">{selectedDonation.donor_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone:</span>
                  <span className="font-mono text-gray-900">{selectedDonation.donor_phone_masked}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount:</span>
                  <span className="font-bold text-sm text-pink-600">
                    ₹{(selectedDonation.amount_paise / 100).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Collecting Agent ID:</span>
                  <span className="font-mono text-gray-900">{selectedDonation.collected_by_agent_id || "N/A"}</span>
                </div>
                {selectedDonation.tax_eligible && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Donor PAN:</span>
                    <span className="font-mono font-bold text-emerald-700">{selectedDonation.donor_pan || "N/A"}</span>
                  </div>
                )}
              </div>

              {/* Deposit Slip Proof */}
              <div>
                <label className="block font-bold text-gray-700 mb-1.5">Bank Deposit Slip / Proof</label>
                {depositProofHref ? (
                  <div className="space-y-2">
                    <a
                      href={depositProofHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-pink-600 font-bold hover:underline"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Uploaded Deposit Receipt
                    </a>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px]">
                    Note: Agent has not yet uploaded a bank deposit slip URL. Proceed only if verified through bank statements.
                  </div>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                Confirming reconciliation will acquire the required row locks, mark payment as captured, increment the campaign raised total, and allocate a sequential receipt number.
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedDonation(null)}
                className="flex-1 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={reconciling}
                onClick={handleConfirmReconcile}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {reconciling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Confirming...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Bank Reconciliation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
