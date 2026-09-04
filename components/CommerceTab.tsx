"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { useUserStore } from "../store/useUserStore";
import { isAdmin } from "@/lib/rbac";
import { useAdminCommerceStore } from "../store/useAdminCommerceStore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Loader2, Save, Store } from "lucide-react";
import { toast } from "./ui/toast";
import { getErrorMessage } from "../lib/errors";
import type { UpdateCommerceSettings } from "../schemas/commerceSchema";

function formatPaise(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatBps(bps: number): string {
  return `${(bps / 100).toFixed(2)}%`;
}

export default function CommerceTab() {
  const { getToken } = useAuth();
  const backendUser = useUserStore((s) => s.backendUser);
  const canManage = isAdmin(backendUser?.role);

  const {
    settings,
    settingsLoading,
    settingsError,
    batches,
    batchesTotal,
    batchesLoading,
    batchesError,
    selectedBatch,
    detailLoading,
    fetchSettings,
    saveSettings,
    fetchBatches,
    fetchBatchDetail,
    markBatchPaid,
    clearSelectedBatch,
  } = useAdminCommerceStore();

  const [page, setPage] = useState(1);
  const [saving, setSaving] = useState(false);
  const [markingPaidId, setMarkingPaidId] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [form, setForm] = useState({
    commissionPercent: "",
    settlementPeriod: "monthly" as "weekly" | "monthly" | "yearly",
    tierId: "",
    onboardingFeeRupees: "",
  });

  const limit = 20;

  useEffect(() => {
    fetchSettings(getToken);
    fetchBatches(getToken, page, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getToken, page]);

  const [prevSettings, setPrevSettings] = useState(settings);
  if (settings !== prevSettings) {
    setPrevSettings(settings);
    if (settings) {
      setForm({
        commissionPercent: (settings.default_commission_rate_bps / 100).toFixed(2),
        settlementPeriod: settings.default_settlement_period as "weekly" | "monthly" | "yearly",
        tierId: settings.default_commission_tier_id?.toString() || "",
        onboardingFeeRupees: (settings.default_onboarding_fee / 100).toFixed(2),
      });
    }
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) return;

    const commissionBps = Math.round(parseFloat(form.commissionPercent || "0") * 100);
    const onboardingPaise = Math.round(parseFloat(form.onboardingFeeRupees || "0") * 100);
    const tierId = form.tierId.trim() ? Number(form.tierId) : null;

    if (Number.isNaN(commissionBps) || commissionBps < 0 || commissionBps > 10000) {
      toast.error("Commission rate must be between 0% and 100%.");
      return;
    }

    const payload: UpdateCommerceSettings = {
      default_commission_rate_bps: commissionBps,
      default_settlement_period: form.settlementPeriod,
      default_commission_tier_id: tierId,
      default_onboarding_fee: Number.isNaN(onboardingPaise) ? 0 : onboardingPaise,
    };

    setSaving(true);
    try {
      await saveSettings(getToken, payload);
      toast.success("Commerce settings saved.");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to save settings."));
    } finally {
      setSaving(false);
    }
  };

  const openBatchDetail = async (id: number) => {
    setDetailOpen(true);
    try {
      await fetchBatchDetail(getToken, id);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to load batch detail."));
      setDetailOpen(false);
    }
  };

  const handleMarkPaid = async (id: number) => {
    if (!canManage) return;
    if (!confirm("Mark this settlement batch as paid out?")) return;
    setMarkingPaidId(id);
    try {
      await markBatchPaid(getToken, id);
      toast.success("Batch marked as paid.");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to mark batch paid."));
    } finally {
      setMarkingPaidId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(batchesTotal / limit));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Store className="w-6 h-6 text-blue-600" />
          Commerce & Commissions
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Platform commission defaults and seller settlement batches
        </p>
      </div>

      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Platform Settings</h3>
        {settingsError && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {settingsError}
          </div>
        )}
        {settingsLoading && !settings ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block font-semibold mb-1 text-slate-500">Default commission (%)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                disabled={!canManage}
                value={form.commissionPercent}
                onChange={(e) => setForm({ ...form, commissionPercent: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg disabled:opacity-60"
              />
              {settings && (
                <p className="text-[10px] text-slate-400 mt-1">
                  Current: {formatBps(settings.default_commission_rate_bps)}
                </p>
              )}
            </div>
            <div>
              <label className="block font-semibold mb-1 text-slate-500">Settlement period</label>
              <select
                disabled={!canManage}
                value={form.settlementPeriod}
                onChange={(e) =>
                  setForm({
                    ...form,
                    settlementPeriod: e.target.value as "weekly" | "monthly" | "yearly",
                  })
                }
                className="w-full px-3 py-2 border rounded-lg bg-white disabled:opacity-60"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1 text-slate-500">Default tier ID (optional)</label>
              <input
                type="number"
                min="1"
                disabled={!canManage}
                value={form.tierId}
                onChange={(e) => setForm({ ...form, tierId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg disabled:opacity-60"
                placeholder="Subscription plan ID"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-slate-500">Default onboarding fee (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                disabled={!canManage}
                value={form.onboardingFeeRupees}
                onChange={(e) => setForm({ ...form, onboardingFeeRupees: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg disabled:opacity-60"
              />
            </div>
            {canManage && (
              <div className="md:col-span-2">
                <Button
                  type="submit"
                  disabled={saving}
                  className="h-9 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-bold text-xs cursor-pointer"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-1.5" />
                      Save Settings
                    </>
                  )}
                </Button>
              </div>
            )}
          </form>
        )}
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Settlement Batches</h3>
        </div>
        {batchesError && (
          <div className="mx-6 mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {batchesError}
          </div>
        )}
        {batchesLoading && batches.length === 0 ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : batches.length === 0 ? (
          <p className="p-10 text-center text-sm text-slate-500">No commission batches yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table className="text-xs">
              <TableHeader className="bg-slate-50">
                <TableRow className="border-b border-slate-100 hover:bg-transparent">
                  <TableHead className="p-4 pl-6 font-bold uppercase text-[10px] text-slate-400">Seller</TableHead>
                  <TableHead className="p-4 font-bold uppercase text-[10px] text-slate-400">Period</TableHead>
                  <TableHead className="p-4 font-bold uppercase text-[10px] text-slate-400">Gross</TableHead>
                  <TableHead className="p-4 font-bold uppercase text-[10px] text-slate-400">Platform fee</TableHead>
                  <TableHead className="p-4 font-bold uppercase text-[10px] text-slate-400">Entries</TableHead>
                  <TableHead className="p-4 font-bold uppercase text-[10px] text-slate-400">Status</TableHead>
                  <TableHead className="p-4 pr-6 text-right font-bold uppercase text-[10px] text-slate-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {batches.map((batch) => (
                  <TableRow key={batch.id} className="hover:bg-slate-50/50">
                    <TableCell className="p-4 pl-6 font-mono text-[11px]">{batch.seller_id}</TableCell>
                    <TableCell className="p-4 capitalize">{batch.settlement_period}</TableCell>
                    <TableCell className="p-4">{formatPaise(batch.total_gross)}</TableCell>
                    <TableCell className="p-4">{formatPaise(batch.total_platform_fee)}</TableCell>
                    <TableCell className="p-4">{batch.entry_count}</TableCell>
                    <TableCell className="p-4">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 border border-slate-200 capitalize">
                        {batch.status.replace("_", " ")}
                      </span>
                    </TableCell>
                    <TableCell className="p-4 pr-6 text-right space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => openBatchDetail(batch.id)}
                        className="h-7 px-2 text-[10px] cursor-pointer"
                      >
                        Details
                      </Button>
                      {canManage && batch.status === "closed" && (
                        <Button
                          type="button"
                          variant="outline"
                          disabled={markingPaidId === batch.id}
                          onClick={() => handleMarkPaid(batch.id)}
                          className="h-7 px-2 text-[10px] text-emerald-700 border-emerald-200 cursor-pointer"
                        >
                          {markingPaidId === batch.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            "Mark paid"
                          )}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        {batchesTotal > limit && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 text-xs">
            <span className="text-slate-500">
              Page {page} of {totalPages} ({batchesTotal} total)
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-7 px-3 text-[10px] cursor-pointer"
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="h-7 px-3 text-[10px] cursor-pointer"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </section>

      <Dialog
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) clearSelectedBatch();
        }}
      >
        <DialogContent className="w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white border border-slate-200 rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Batch Detail</DialogTitle>
          </DialogHeader>
          {detailLoading || !selectedBatch ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>
                  <span className="text-slate-400">Seller:</span> {selectedBatch.batch.seller_id}
                </div>
                <div>
                  <span className="text-slate-400">Status:</span> {selectedBatch.batch.status}
                </div>
                <div>
                  <span className="text-slate-400">Gross:</span> {formatPaise(selectedBatch.batch.total_gross)}
                </div>
                <div>
                  <span className="text-slate-400">Platform fee:</span>{" "}
                  {formatPaise(selectedBatch.batch.total_platform_fee)}
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[10px]">Payment</TableHead>
                    <TableHead className="text-[10px]">Gross</TableHead>
                    <TableHead className="text-[10px]">Fee</TableHead>
                    <TableHead className="text-[10px]">Net</TableHead>
                    <TableHead className="text-[10px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedBatch.entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>#{entry.payment_id}</TableCell>
                      <TableCell>{formatPaise(entry.gross_amount)}</TableCell>
                      <TableCell>{formatPaise(entry.platform_fee)}</TableCell>
                      <TableCell>{formatPaise(entry.seller_net)}</TableCell>
                      <TableCell className="capitalize">{entry.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
