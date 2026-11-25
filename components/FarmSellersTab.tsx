"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { useAdminFarmSellerStore } from "@/store/useAdminFarmSellerStore";
import {
  Sprout,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  RefreshCw,
  Loader2,
  ShieldCheck,
  User,
  Phone,
  Mail,
} from "lucide-react";

const STATUS_FILTERS = [
  { id: "pending", label: "Pending Review" },
  { id: "active", label: "Active Producers" },
  { id: "rejected", label: "Rejected" },
  { id: "all", label: "All Applications" },
];

export default function FarmSellersTab() {
  const { getToken } = useAuth();
  const {
    sellers,
    loading,
    actionLoadingId,
    error,
    statusFilter,
    searchQuery,
    setStatusFilter,
    setSearchQuery,
    fetchSellers,
    approve,
    reject,
  } = useAdminFarmSellerStore();

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetchSellers(getToken, statusFilter, searchQuery);
  }, [fetchSellers, getToken, statusFilter, searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localSearch);
  };

  const handleApprove = async (userId: string, name: string) => {
    if (!confirm(`Are you sure you want to approve farmer "${name || userId}" for produce selling?`)) {
      return;
    }
    try {
      await approve(getToken, userId);
      setFeedback({
        type: "success",
        message: `Farmer "${name || userId}" approved successfully. They can now list produce.`,
      });
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Failed to approve farmer application.",
      });
    }
  };

  const handleReject = async (userId: string, name: string) => {
    if (!confirm(`Reject or revoke farm selling privileges for "${name || userId}"?`)) {
      return;
    }
    try {
      await reject(getToken, userId);
      setFeedback({
        type: "success",
        message: `Application for "${name || userId}" marked as rejected.`,
      });
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Failed to reject farmer application.",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
              <Sprout className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Farm Producer Approvals</h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Review and approve farmer applications for the Paykop Farm vertical. Approved farmers enjoy zero-SaaS commission-only listings.
          </p>
        </div>

        <button
          onClick={() => fetchSellers(getToken)}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Notifications */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-rose-50 border border-rose-200 text-rose-800"
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="text-xs font-bold underline ml-4 cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl text-sm font-medium bg-rose-50 border border-rose-200 text-rose-800">
          {error}
        </div>
      )}

      {/* Controls Bar: Status Filter & Search */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Status Filters */}
        <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                statusFilter === f.id
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, phone, or ID..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </form>
      </div>

      {/* Sellers List Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading && sellers.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-64 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <p className="text-xs text-slate-500 font-medium">Loading farmer applications...</p>
          </div>
        ) : sellers.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-2">
            <Sprout className="w-10 h-10 text-slate-300" />
            <p className="text-slate-800 font-bold text-sm">No farm sellers found</p>
            <p className="text-slate-500 text-xs max-w-sm">
              {statusFilter === "pending"
                ? "There are currently no pending farmer applications to review."
                : `No farm seller records match the selected "${statusFilter}" status.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-100">
                <tr>
                  <th className="p-4 pl-6 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Farmer / User</th>
                  <th className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Contact Info</th>
                  <th className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">KYC Status</th>
                  <th className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Role Status</th>
                  <th className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Applied Date</th>
                  <th className="p-4 pr-6 text-right text-slate-400 font-bold uppercase tracking-wider text-[10px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sellers.map((s) => {
                  const fullName = `${s.first_name || ""} ${s.last_name || ""}`.trim() || "Farmer Applicant";
                  const isPending = s.status === "pending";
                  const isActive = s.status === "active";
                  const isActing = actionLoadingId === s.user_id;

                  return (
                    <tr key={s.user_id} className="hover:bg-slate-50/50 transition">
                      {/* Name & ID */}
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold text-xs shrink-0">
                            {s.first_name ? s.first_name[0].toUpperCase() : <User className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{fullName}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{s.user_id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="p-4">
                        <div className="space-y-1">
                          {s.phone ? (
                            <div className="flex items-center gap-1.5 text-slate-700">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{s.phone}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                          {s.email && (
                            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span className="truncate max-w-[180px]">{s.email}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* KYC Status */}
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border capitalize ${
                            s.kyc_status === "verified"
                              ? "bg-blue-50 border-blue-200 text-blue-700"
                              : s.kyc_status === "pending"
                              ? "bg-amber-50 border-amber-200 text-amber-700"
                              : "bg-slate-100 border-slate-200 text-slate-600"
                          }`}
                        >
                          <ShieldCheck className="w-3 h-3" />
                          {s.kyc_status || "unverified"}
                        </span>
                      </td>

                      {/* Application / Role Status */}
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border capitalize ${
                            isActive
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                              : isPending
                              ? "bg-amber-50 border-amber-200 text-amber-700"
                              : "bg-rose-50 border-rose-200 text-rose-700"
                          }`}
                        >
                          {isActive ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : isPending ? (
                            <Clock className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          {s.status}
                        </span>
                      </td>

                      {/* Applied Date */}
                      <td className="p-4 text-slate-500">
                        {new Date(s.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Action Buttons */}
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isActing ? (
                            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                          ) : (
                            <>
                              {!isActive && (
                                <button
                                  onClick={() => handleApprove(s.user_id, fullName)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer shadow-sm"
                                  title="Approve seller role for Farm vertical"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  Approve
                                </button>
                              )}
                              {s.status !== "rejected" && (
                                <button
                                  onClick={() => handleReject(s.user_id, fullName)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 font-bold text-xs transition cursor-pointer"
                                  title="Reject or revoke farm seller role"
                                >
                                  <XCircle className="w-3 h-3" />
                                  Reject
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
