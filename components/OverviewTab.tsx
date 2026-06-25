// src/components/OverviewTab.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useDashboardStore } from "../store/useDashboardStore";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { Users, TrendingUp, Heart, CreditCard, ArrowRight } from "lucide-react";

export default function OverviewTab() {
  const router = useRouter();
  const campaigns = useDashboardStore((state) => state.campaigns);

  const pendingApprovalsCount = campaigns.filter((c) => c.status === "pending").length;

  const metrics = [
    {
      label: "Total users",
      value: "48,920",
      change: "+6.2% vs last month",
      icon: Users,
      iconColor: "text-blue-500 bg-blue-500/10",
      changeColor: "text-emerald-500",
    },
    {
      label: "Active users",
      value: "21,340",
      change: "+3.8% vs last month",
      icon: TrendingUp,
      iconColor: "text-blue-500 bg-blue-500/10",
      changeColor: "text-emerald-500",
    },
    {
      label: "Total donations",
      value: "₹2.84Cr",
      change: "+11.4% vs last month",
      icon: Heart,
      iconColor: "text-rose-500 bg-rose-500/10",
      changeColor: "text-emerald-500",
    },
    {
      label: "Subscription revenue",
      value: "₹18.6L",
      change: "+8.0% vs last month",
      icon: CreditCard,
      iconColor: "text-indigo-500 bg-indigo-500/10",
      changeColor: "text-emerald-500",
    },
  ];

  const modules = [
    { name: "Products", percentage: 42, color: "bg-blue-600" },
    { name: "Services", percentage: 31, color: "bg-indigo-600" },
    { name: "Donations", percentage: 19, color: "bg-emerald-600" },
    { name: "Subscriptions", percentage: 8, color: "bg-amber-600" },
  ];

  const chartBars = [
    { label: "W1", height: "h-[35%]", active: false },
    { label: "W2", height: "h-[60%]", active: false },
    { label: "W3", height: "h-[50%]", active: false },
    { label: "W4", height: "h-[90%]", active: true },
    { label: "W5", height: "h-[75%]", active: false },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Overview</h2>
          <p className="text-sm text-slate-500 mt-0.5">Platform health · last 30 days</p>
        </div>
        <div>
          <Select defaultValue="jun-2026">
            <SelectTrigger className="w-[120px] bg-white border border-slate-200 text-slate-700 font-semibold text-xs rounded-lg shadow-sm">
              <SelectValue placeholder="Select date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="jun-2026" className="text-xs">Jun 2026</SelectItem>
              <SelectItem value="may-2026" className="text-xs">May 2026</SelectItem>
              <SelectItem value="apr-2026" className="text-xs">Apr 2026</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <Card key={i} className="bg-white border border-slate-200 rounded-2xl shadow-sm">
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div className="flex items-start justify-between w-full">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{m.label}</span>
                  <div className={`p-2 rounded-lg ${m.iconColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-bold text-slate-900 tracking-tight">{m.value}</span>
                  <p className={`text-xs font-bold mt-1 ${m.changeColor}`}>{m.change}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Chart & Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Transactions volume */}
        <Card className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col justify-between min-h-[300px]">
          <CardHeader className="p-5 pb-0 flex flex-row items-center justify-between">
            <CardTitle className="font-bold text-slate-800 text-sm">Transactions volume</CardTitle>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Weekly</span>
          </CardHeader>
          <CardContent className="p-5 pt-4 flex-1 flex flex-col justify-end">
            <div className="flex-1 flex items-end justify-around h-44 pb-2 border-b border-slate-100">
              {chartBars.map((bar, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 w-12 h-full justify-end">
                  <div
                    className={`w-full rounded-md transition-all duration-300 ${bar.height} ${
                      bar.active ? "bg-blue-600 shadow-md shadow-blue-500/20" : "bg-indigo-100 hover:bg-indigo-200"
                    }`}
                  />
                  <span className={`text-[10px] font-bold ${bar.active ? "text-blue-600 font-extrabold" : "text-slate-400"}`}>
                    {bar.label}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* By module */}
        <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col justify-between">
          <CardHeader className="p-5 pb-0">
            <CardTitle className="font-bold text-slate-800 text-sm">By module</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-4">
            <div className="space-y-4">
              {modules.map((mod, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-500">{mod.name}</span>
                    <span className="text-slate-800">{mod.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className={`${mod.color} h-full rounded-full`} style={{ width: `${mod.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending alerts banner */}
      {pendingApprovalsCount > 0 && (
        <Alert className="bg-amber-500/10 border border-amber-500/25 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center font-bold text-amber-600 text-xs shrink-0">
              ⚠️
            </div>
            <div>
              <AlertTitle className="text-sm font-semibold text-amber-800 mb-0.5">Pending donation approvals</AlertTitle>
              <AlertDescription className="text-xs text-amber-700/80 leading-normal">
                {pendingApprovalsCount} campaign{pendingApprovalsCount > 1 ? "s" : ""} waiting for review before they go public.
              </AlertDescription>
            </div>
          </div>
          <Button
            onClick={() => router.push("/approvals")}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm shadow-blue-500/10 cursor-pointer h-9 shrink-0"
          >
            <span>Open queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Alert>
      )}
    </div>
  );
}
