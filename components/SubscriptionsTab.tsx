// src/components/SubscriptionsTab.tsx
"use client";

import React, { useState } from "react";
import { Card, CardContent } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Plus, Check } from "lucide-react";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  users: string;
  active: boolean;
  popular?: boolean;
}

export default function SubscriptionsTab() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([
    { id: "s1", name: "Free", price: "₹0", users: "28,400 users", active: true },
    { id: "s2", name: "Basic", price: "₹199", users: "12,100 users", active: true },
    { id: "s3", name: "Premium", price: "₹499", users: "7,640 users", active: true, popular: true },
    { id: "s4", name: "Enterprise", price: "₹2,499", users: "780 users", active: true },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [newPlan, setNewPlan] = useState({ name: "", price: "" });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlan.name || !newPlan.price) return;

    const priceFormatted = newPlan.price.startsWith("₹") ? newPlan.price : `₹${newPlan.price}`;

    const created: SubscriptionPlan = {
      id: `s-${Date.now()}`,
      name: newPlan.name,
      price: priceFormatted,
      users: "0 users",
      active: true,
    };

    setPlans((prev) => [...prev, created]);
    setNewPlan({ name: "", price: "" });
    setModalOpen(false);
  };

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
            <DialogContent className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-left relative">
              <DialogHeader>
                <DialogTitle className="text-base font-bold text-slate-900 mb-2">Create Membership Tier</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleCreate} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1 text-slate-500 uppercase tracking-wider">Plan Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Standard, Growth"
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
                    placeholder="e.g. 999"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                    value={newPlan.price}
                    onChange={(e) => setNewPlan({ ...newPlan, price: e.target.value })}
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
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative bg-white border rounded-2xl shadow-sm flex flex-col justify-between min-h-[170px] ${
              plan.popular ? "border-blue-600 ring-1 ring-blue-600" : "border-slate-200"
            }`}
          >
            {/* Popular Badge */}
            {plan.popular && (
              <span className="absolute -top-2.5 right-6 bg-blue-600 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md tracking-wider z-10">
                Popular
              </span>
            )}

            <CardContent className="p-6 flex flex-col justify-between h-full w-full">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">{plan.name}</h3>
                <p className="text-3xl font-extrabold text-slate-900 tracking-tight mt-3">{plan.price}</p>
                <p className="text-xs text-slate-400 font-semibold mt-1">{plan.users}</p>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-bold">
                  <Check className="w-3 h-3 shrink-0" />
                  Active
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
