// src/components/SubscriptionsTab.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Card, CardContent } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Plus, Check, Trash2, Loader2 } from "lucide-react";
import {
  fetchSubscriptionPlans,
  createSubscriptionPlan,
  deleteSubscriptionPlan,
} from "../services/subscriptionService";
import { SubscriptionPlan } from "../schemas/subscriptionSchema";

export default function SubscriptionsTab() {
  const { getToken } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [newPlan, setNewPlan] = useState({ name: "", price: "", duration_days: "30" });

  const loadPlans = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;
      const data = await fetchSubscriptionPlans(token);
      setPlans(data);
    } catch (err) {
      console.error("Failed to fetch plans:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, [getToken]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlan.name || !newPlan.price || !newPlan.duration_days) return;

    try {
      const token = await getToken();
      if (!token) return;

      const priceInPaise = Math.round(parseFloat(newPlan.price) * 100);
      const durationDays = parseInt(newPlan.duration_days, 10);

      await createSubscriptionPlan(token, {
        name: newPlan.name,
        price: priceInPaise,
        duration_days: durationDays,
        is_active: true,
      });

      setNewPlan({ name: "", price: "", duration_days: "30" });
      setModalOpen(false);
      loadPlans();
    } catch (err) {
      console.error("Failed to create plan:", err);
      alert("Error creating plan");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to deactivate/delete this subscription plan?")) return;
    try {
      const token = await getToken();
      if (!token) return;
      await deleteSubscriptionPlan(token, id);
      loadPlans();
    } catch (err) {
      console.error("Failed to delete plan:", err);
      alert("Error deactivating plan");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Subscription plans</h2>
          <p className="text-sm text-slate-500 mt-0.5">Create, edit & manage membership tiers</p>
        </div>
        <div>
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm shadow-blue-500/10 cursor-pointer h-9"
              >
                <Plus className="w-4 h-4" />
                <span>New plan</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-left">
              <DialogHeader>
                <DialogTitle className="text-base font-bold text-slate-900 mb-2">Create Membership Tier</DialogTitle>
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
                    Create tier
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Plans List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {plans.length === 0 ? (
          <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-500 font-medium">
            No active subscription plans found. Click &quot;New plan&quot; to configure one.
          </div>
        ) : (
          plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative bg-white border rounded-2xl shadow-sm flex flex-col justify-between min-h-[190px] border-slate-200`}
            >
              <CardContent className="p-6 flex flex-col justify-between h-full w-full">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{plan.name}</h3>
                  <p className="text-3xl font-extrabold text-slate-900 tracking-tight mt-3">₹{plan.price / 100}</p>
                  <p className="text-xs text-slate-400 font-semibold mt-1">{plan.duration_days} days validity</p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    plan.is_active 
                      ? "bg-emerald-50 border border-emerald-200 text-emerald-600" 
                      : "bg-slate-100 border border-slate-200 text-slate-500"
                  }`}>
                    {plan.is_active ? (
                      <>
                        <Check className="w-3 h-3 shrink-0" />
                        Active
                      </>
                    ) : (
                      "Suspended"
                    )}
                  </span>
                  
                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Deactivate Plan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
