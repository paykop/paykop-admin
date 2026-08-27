// src/components/OverviewTab.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { useDashboardStore } from "../store/useDashboardStore";
import { fetchAdminMetrics } from "../services/dashboardService";
import { AdminMetrics } from "../schemas/dashboardSchema";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { Users, TrendingUp, Heart, CreditCard, ArrowRight, Loader2, Activity } from "lucide-react";

export default function OverviewTab() {
  const router = useRouter();
  const { getToken } = useAuth();

  const { data, loading, fetchDashboard } = useDashboardStore();
  const [metricsData, setMetricsData] = useState<AdminMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);

  useEffect(() => {
    fetchDashboard(getToken);
    (async () => {
      try {
        setMetricsLoading(true);
        const token = await getToken();
        if (!token) return;
        const m = await fetchAdminMetrics(token);
        setMetricsData(m);
      } catch (err) {
        console.error("Failed to fetch admin metrics:", err);
        setMetricsData(null);
      } finally {
        setMetricsLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getToken]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const counts = data?.counts || {
    total_users: 0,
    buyers: 0,
    sellers: 0,
    agents: 0,
    admins: 0,
    pending_products: 0,
    approved_products: 0,
    rejected_products: 0,
  };

  const pendingApprovalsCount = counts.pending_products;
  const productTotal =
    counts.approved_products + counts.pending_products + counts.rejected_products;
  const pct = (n: number) => (productTotal > 0 ? Math.round((n / productTotal) * 100) : 0);

  const productMix = [
    { name: "Approved", count: counts.approved_products, percentage: pct(counts.approved_products), color: "bg-emerald-600" },
    { name: "Pending", count: counts.pending_products, percentage: pct(counts.pending_products), color: "bg-amber-500" },
    { name: "Rejected", count: counts.rejected_products, percentage: pct(counts.rejected_products), color: "bg-rose-500" },
  ];

  const metricCards = [
    {
      label: "Total users",
      value: counts.total_users.toLocaleString(),
      change: `Buyers: ${counts.buyers}, Sellers: ${counts.sellers}`,
      icon: Users,
      iconColor: "text-blue-500 bg-blue-500/10",
      changeColor: "text-slate-500",
    },
    {
      label: "Approved Products",
      value: counts.approved_products.toLocaleString(),
      change: `Pending: ${counts.pending_products}`,
      icon: TrendingUp,
      iconColor: "text-blue-500 bg-blue-500/10",
      changeColor: "text-amber-500",
    },
    {
      label: "Agents",
      value: (counts.agents ?? 0).toLocaleString(),
      change: `Admins: ${counts.admins}`,
      icon: Heart,
      iconColor: "text-rose-500 bg-rose-500/10",
      changeColor: "text-slate-500",
    },
    {
      label: "Total Products",
      value: productTotal.toLocaleString(),
      change: `Rejected: ${counts.rejected_products}`,
      icon: CreditCard,
      iconColor: "text-indigo-500 bg-indigo-500/10",
      changeColor: "text-rose-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Overview</h2>
          <p className="text-sm text-slate-500 mt-0.5">Platform counts · Live</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((m, i) => {
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col min-h-[240px]">
          <CardHeader className="p-5 pb-0 flex flex-row items-center justify-between">
            <CardTitle className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              System diagnostics
            </CardTitle>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Live metrics</span>
          </CardHeader>
          <CardContent className="p-5 pt-4">
            {metricsLoading && !metricsData ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : !metricsData ? (
              <p className="text-sm text-slate-400 py-8 text-center">Diagnostics unavailable.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Uptime</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">{metricsData.uptime_human || "—"}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{metricsData.uptime_seconds?.toLocaleString() ?? 0}s</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Geocode cache</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">{metricsData.geocode_cache_hit_rate || "—"}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {metricsData.geocode_cache_hit_count}/{metricsData.geocode_call_count} hits
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Auth errors</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">{metricsData.auth_error_count ?? 0}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Provider faults</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Chat persistence</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">{metricsData.chat_persistence_error_count ?? 0}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Write failures</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col justify-between">
          <CardHeader className="p-5 pb-0">
            <CardTitle className="font-bold text-slate-800 text-sm">Product review mix</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-4">
            {productTotal === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">No products yet.</p>
            ) : (
              <div className="space-y-4">
                {productMix.map((mod) => (
                  <div key={mod.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-500">{mod.name}</span>
                      <span className="text-slate-800">
                        {mod.count} · {mod.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className={`${mod.color} h-full rounded-full`} style={{ width: `${mod.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {pendingApprovalsCount > 0 && (
        <Alert className="bg-amber-500/10 border border-amber-500/25 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center font-bold text-amber-600 text-xs shrink-0">
              !
            </div>
            <div>
              <AlertTitle className="text-sm font-semibold text-amber-800 mb-0.5">Pending product approvals</AlertTitle>
              <AlertDescription className="text-xs text-amber-700/80 leading-normal">
                {pendingApprovalsCount} product{pendingApprovalsCount > 1 ? "s" : ""} waiting for review before they go public.
              </AlertDescription>
            </div>
          </div>
          <Button
            onClick={() => router.push("/products")}
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
