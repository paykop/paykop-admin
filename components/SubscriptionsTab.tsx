// src/components/SubscriptionsTab.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/useAuth";
import { useUserStore } from "../store/useUserStore";
import { isAdmin } from "@/lib/rbac";
import { useAdminSubscriptionsStore } from "../store/useAdminSubscriptionsStore";
import { Card, CardContent } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Plus, Check, Trash2, Loader2, Edit } from "lucide-react";
import { SubscriptionPlan } from "../schemas/subscriptionSchema";
import { toast } from "./ui/toast";
import { getErrorMessage } from "../lib/errors";

type Panel = "plans" | "history" | "reconciliation";

export default function SubscriptionsTab() {
  const { getToken } = useAuth();
  const backendUser = useUserStore((s) => s.backendUser);
  const canManagePlans = isAdmin(backendUser?.role);

  const {
    plans,
    history,
    reconciliations,
    loading,
    fetchPlans,
    fetchHistory,
    fetchReconciliations,
    createPlan,
    updatePlan,
    deletePlan,
    resolveReconciliation,
  } = useAdminSubscriptionsStore();

  const [panel, setPanel] = useState<Panel>("plans");
  const [modalOpen, setModalOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<SubscriptionPlan | null>(null);
  const [newPlan, setNewPlan] = useState({ name: "", price: "", duration_days: "30" });
  const [resolvePlanId, setResolvePlanId] = useState<Record<number, string>>({});
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        if (panel === "plans") {
          await fetchPlans(getToken);
        } else if (panel === "history") {
          await fetchHistory(getToken);
        } else {
          if (plans.length === 0) await fetchPlans(getToken);
          await fetchReconciliations(getToken);
        }
      } catch (err) {
        if (panel === "history") toast.error("Failed to load subscription history.");
        if (panel === "reconciliation") toast.error("Failed to load reconciliation queue.");
        console.error(err);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getToken, panel]);

  const switchPanel = (next: Panel) => {
    setPanel(next);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManagePlans || !newPlan.name || !newPlan.price || !newPlan.duration_days) return;

    try {
      const priceInPaise = Math.round(parseFloat(newPlan.price) * 100);
      const durationDays = parseInt(newPlan.duration_days, 10);

      if (editPlan) {
        await updatePlan(getToken, editPlan.id, {
          name: newPlan.name,
          price: priceInPaise,
          duration_days: durationDays,
        });
        toast.success("Plan updated.");
      } else {
        await createPlan(getToken, {
          name: newPlan.name,
          price: priceInPaise,
          duration_days: durationDays,
          is_active: true,
        });
        toast.success("Plan created.");
      }

      setNewPlan({ name: "", price: "", duration_days: "30" });
      setEditPlan(null);
      setModalOpen(false);
    } catch (err) {
      console.error("Failed to save plan:", err);
      toast.error(getErrorMessage(err, "Error saving plan"));
    }
  };

  const openEdit = (plan: SubscriptionPlan) => {
    setEditPlan(plan);
    setNewPlan({
      name: plan.name,
      price: String(plan.price / 100),
      duration_days: String(plan.duration_days),
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!canManagePlans) return;
    if (!confirm("Are you sure you want to deactivate/delete this subscription plan?")) return;
    try {
      await deletePlan(getToken, id);
      toast.success("Subscription plan deleted successfully!");
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "");
      if (msg.includes("in use") || msg.includes("cannot be modified or deleted")) {
        toast.error(
          "Cannot delete plan because active user subscriptions or payments are linked to it.",
          "Plan In Use"
        );
      } else {
        toast.error(msg || "Failed to delete subscription plan.");
      }
    }
  };

  const handleResolve = async (id: number) => {
    if (!canManagePlans) return;
    const planId = parseInt(resolvePlanId[id] || "", 10);
    if (!planId) {
      toast.error("Select a local plan to map this subscription.");
      return;
    }
    setProcessingId(id);
    try {
      await resolveReconciliation(getToken, id, planId);
      toast.success("Reconciliation resolved successfully.");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to resolve reconciliation."));
    } finally {
      setProcessingId(null);
    }
  };

  if (loading && plans.length === 0 && reconciliations.length === 0 && history.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Subscriptions</h2>
          <p className="text-sm text-slate-500 mt-0.5">Membership tiers and webhook reconciliation</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 flex-wrap">
            <button
              onClick={() => switchPanel("plans")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                panel === "plans" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
            >
              Plans
            </button>
            <button
              onClick={() => switchPanel("history")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                panel === "history" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
            >
              History
            </button>
            <button
              onClick={() => switchPanel("reconciliation")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                panel === "reconciliation" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
            >
              Reconciliation
            </button>
          </div>
          {panel === "plans" && canManagePlans && (
            <Dialog
              open={modalOpen}
              onOpenChange={(open) => {
                setModalOpen(open);
                if (!open) {
                  setEditPlan(null);
                  setNewPlan({ name: "", price: "", duration_days: "30" });
                }
              }}
            >
              <DialogTrigger asChild>
                <Button className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm shadow-blue-500/10 cursor-pointer h-9">
                  <Plus className="w-4 h-4" />
                  <span>New plan</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-md max-h-[85vh] overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-left">
                <DialogHeader>
                  <DialogTitle className="text-base font-bold text-slate-900 mb-2">
                    {editPlan ? "Edit Membership Tier" : "Create Membership Tier"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold mb-1 text-slate-500 uppercase tracking-wider">Plan Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Pro Seller, Growth"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                      value={newPlan.name}
                      onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-slate-500 uppercase tracking-wider">Monthly Price (INR)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 499"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                      value={newPlan.price}
                      onChange={(e) => setNewPlan({ ...newPlan, price: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-slate-500 uppercase tracking-wider">Duration (Days)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 30"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                      value={newPlan.duration_days}
                      onChange={(e) => setNewPlan({ ...newPlan, duration_days: e.target.value })}
                    />
                  </div>
                  <div className="pt-2">
                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl transition text-sm flex items-center justify-center cursor-pointer shadow-md shadow-blue-500/10 border-transparent h-10"
                    >
                      {editPlan ? "Save changes" : "Create tier"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {panel === "plans" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.length === 0 ? (
            <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-500 font-medium">
              No active subscription plans found.
            </div>
          ) : (
            plans.map((plan) => (
              <Card
                key={plan.id}
                className="relative bg-white border rounded-2xl shadow-sm flex flex-col justify-between min-h-[190px] border-slate-200"
              >
                <CardContent className="p-6 flex flex-col justify-between h-full w-full">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{plan.name}</h3>
                    <p className="text-3xl font-extrabold text-slate-900 tracking-tight mt-3">₹{plan.price / 100}</p>
                    <p className="text-xs text-slate-400 font-semibold mt-1">{plan.duration_days} days validity</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        plan.is_active
                          ? "bg-emerald-50 border border-emerald-200 text-emerald-600"
                          : "bg-slate-100 border border-slate-200 text-slate-500"
                      }`}
                    >
                      {plan.is_active ? (
                        <>
                          <Check className="w-3 h-3 shrink-0" />
                          Active
                        </>
                      ) : (
                        "Suspended"
                      )}
                    </span>
                    {canManagePlans && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(plan)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Plan"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(plan.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Deactivate Plan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : panel === "history" ? (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {history.length === 0 ? (
            <div className="p-10 text-center text-slate-500 text-sm">No subscription history.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="text-xs">
                <TableHeader className="bg-slate-50">
                  <TableRow className="border-b border-slate-100 hover:bg-transparent">
                    <TableHead className="p-4 pl-6 text-slate-400 font-bold uppercase tracking-wider text-[10px]">User</TableHead>
                    <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Plan</TableHead>
                    <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Status</TableHead>
                    <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Starts</TableHead>
                    <TableHead className="p-4 pr-6 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Expires</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-100">
                  {history.map((h) => (
                    <TableRow key={h.id} className="hover:bg-slate-50/50 border-b border-slate-100">
                      <TableCell className="p-4 pl-6 font-mono text-[11px]">{h.user_id}</TableCell>
                      <TableCell className="p-4 font-semibold text-slate-700">{h.plan}</TableCell>
                      <TableCell className="p-4 capitalize text-slate-600">{h.status}</TableCell>
                      <TableCell className="p-4 text-slate-500">
                        {h.starts_at ? new Date(h.starts_at).toLocaleString("en-IN") : "—"}
                      </TableCell>
                      <TableCell className="p-4 pr-6 text-slate-500">
                        {h.expires_at ? new Date(h.expires_at).toLocaleString("en-IN") : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {reconciliations.length === 0 ? (
            <div className="p-10 text-center text-slate-500 text-sm">No unresolved reconciliation items.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="text-xs">
                <TableHeader className="bg-slate-50">
                  <TableRow className="border-b border-slate-100 hover:bg-transparent">
                    <TableHead className="p-4 pl-6 text-slate-400 font-bold uppercase tracking-wider text-[10px]">User</TableHead>
                    <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Razorpay Plan</TableHead>
                    <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Amount</TableHead>
                    <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Created</TableHead>
                    <TableHead className="p-4 pr-6 text-right text-slate-400 font-bold uppercase tracking-wider text-[10px]">Resolve</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-100">
                  {reconciliations.map((item) => (
                    <TableRow key={item.id} className="hover:bg-slate-50/50 border-b border-slate-100">
                      <TableCell className="p-4 pl-6 font-mono text-[11px] text-slate-700">
                        {item.user_id || "—"}
                      </TableCell>
                      <TableCell className="p-4 font-mono text-[11px] text-slate-600">
                        {item.razorpay_plan_id}
                      </TableCell>
                      <TableCell className="p-4 font-bold text-slate-800">
                        ₹{(item.amount / 100).toFixed(2)}
                      </TableCell>
                      <TableCell className="p-4 text-slate-500">
                        {new Date(item.created_at).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="p-4 pr-6 text-right">
                        {canManagePlans ? (
                          <div className="flex justify-end items-center gap-2 flex-wrap">
                            <select
                              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] font-semibold"
                              value={resolvePlanId[item.id] || ""}
                              onChange={(e) =>
                                setResolvePlanId((prev) => ({ ...prev, [item.id]: e.target.value }))
                              }
                            >
                              <option value="">Select plan</option>
                              {plans.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name}
                                </option>
                              ))}
                            </select>
                            <Button
                              onClick={() => handleResolve(item.id)}
                              disabled={processingId === item.id}
                              className="h-8 px-3 rounded-lg bg-blue-600 text-white text-[10px] font-bold cursor-pointer"
                            >
                              {processingId === item.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                "Resolve"
                              )}
                            </Button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400">Admin only</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
