// src/components/OverviewTab.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { useDashboardStore } from "../store/useDashboardStore";
import { fetchAdminMetrics } from "../services/dashboardService";
import { AdminMetrics } from "../schemas/dashboardSchema";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import {
  Users,
  TrendingUp,
  Shield,
  Package,
  ChevronRight,
  Clock,
  MapPin,
  MessageSquare,
  Activity,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { useTour } from "@/lib/tour/useTour";
import { useUserStore } from "../store/useUserStore";

function formatUptime(uptimeHuman?: string, uptimeSeconds?: number): string {
  if (uptimeSeconds !== undefined && uptimeSeconds > 0) {
    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0 || days > 0) parts.push(`${hours}h`);
    parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);
    return parts.join(" ");
  }

  if (!uptimeHuman || uptimeHuman === "—") return "—";
  return uptimeHuman
    .replace(/(\d+)([a-zA-Z]+)/g, "$1$2 ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function OverviewTab() {
  const router = useRouter();
  const { getToken } = useAuth();
  const backendUser = useUserStore((s) => s.backendUser);

  const { data, loading, fetchDashboard } = useDashboardStore();
  const [metricsData, setMetricsData] = useState<AdminMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);

  useTour("admin-overview", {
    ready: backendUser?.role === "admin" && !loading && !metricsLoading,
  });

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
    {
      name: "Approved",
      count: counts.approved_products,
      percentage: pct(counts.approved_products),
      color: "bg-emerald-500",
    },
    {
      name: "Pending",
      count: counts.pending_products,
      percentage: pct(counts.pending_products),
      color: "bg-amber-500",
    },
    {
      name: "Rejected",
      count: counts.rejected_products,
      percentage: pct(counts.rejected_products),
      color: "bg-rose-500",
    },
  ];

  const metricCards = [
    {
      label: "TOTAL USERS",
      value: counts.total_users.toLocaleString(),
      change: `Buyers: ${counts.buyers}  Sellers: ${counts.sellers}`,
      changeColor: "text-slate-500",
      icon: Users,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
      arrowBg: "bg-blue-50/80 text-blue-500 hover:bg-blue-100",
      bottomBorder: "border-b-blue-500",
      href: "/users",
    },
    {
      label: "APPROVED PRODUCTS",
      value: counts.approved_products.toLocaleString(),
      change: `Pending: ${counts.pending_products}`,
      changeColor: "text-amber-500",
      icon: TrendingUp,
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-50",
      arrowBg: "bg-blue-50/80 text-blue-500 hover:bg-blue-100",
      bottomBorder: "border-b-emerald-500",
      href: "/products",
    },
    {
      label: "AGENTS",
      value: (counts.agents ?? 0).toLocaleString(),
      change: `Admins: ${counts.admins}`,
      changeColor: "text-slate-500",
      icon: Shield,
      iconColor: "text-rose-500",
      iconBg: "bg-rose-50",
      arrowBg: "bg-purple-50/80 text-purple-500 hover:bg-purple-100",
      bottomBorder: "border-b-rose-500",
      href: "/agents",
    },
    {
      label: "TOTAL PRODUCTS",
      value: productTotal.toLocaleString(),
      change: `Rejected: ${counts.rejected_products}`,
      changeColor: "text-rose-500",
      icon: Package,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-50",
      arrowBg: "bg-purple-50/80 text-purple-500 hover:bg-purple-100",
      bottomBorder: "border-b-purple-500",
      href: "/products",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Overview</h2>
          <p className="text-sm font-medium text-slate-400 mt-1">Platform counts · Live</p>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5" data-tour="overview-metrics">
        {metricCards.map((m, i) => {
          const Icon = m.icon;
          return (
            <div
              key={i}
              onClick={() => router.push(m.href)}
              className={`bg-white border border-slate-200/80 ${m.bottomBorder} border-b-[3px] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group`}
            >
              {/* Top row: Icon + Label side-by-side */}
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${m.iconBg}`}>
                  <Icon className={`w-4.5 h-4.5 ${m.iconColor}`} />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {m.label}
                </span>
              </div>

              {/* Middle row: Big Value + Right Chevron Arrow Button */}
              <div className="mt-3 flex items-center justify-between">
                <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {m.value}
                </div>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center ${m.arrowBg} group-hover:scale-110 transition-transform shrink-0`}
                >
                  <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>

              {/* Bottom row: Subtext info */}
              <p className={`text-xs font-semibold mt-1 ${m.changeColor}`}>
                {m.change}
              </p>
            </div>
          );
        })}
      </div>

      {/* Diagnostics and Product review mix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        {/* System Diagnostics (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <Activity className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-lg">System diagnostics</h3>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live metrics
              </span>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200/50 rounded-xl px-3 py-1.5 transition cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>Uptime</span>
            </button>
          </div>

          {metricsLoading && !metricsData ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : !metricsData ? (
            <p className="text-sm text-slate-400 py-16 text-center font-medium">Diagnostics unavailable.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              {/* UPTIME */}
              <div className="rounded-2xl border border-slate-100 bg-[#f8fafc] p-4 flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">UPTIME</p>
                  <p className="text-xl font-bold text-slate-900 mt-0.5 leading-tight">
                    {formatUptime(metricsData.uptime_human, metricsData.uptime_seconds)}
                  </p>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    {metricsData.uptime_seconds?.toLocaleString() ?? 0}s
                  </p>
                  <div className="mt-2.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Online
                    </span>
                  </div>
                </div>
              </div>

              {/* GEOCODE CACHE */}
              <div className="rounded-2xl border border-slate-100 bg-[#f8fafc] p-4 flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-purple-50 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">GEOCODE CACHE</p>
                  <p className="text-xl font-bold text-slate-900 mt-0.5 leading-tight">
                    {metricsData.geocode_cache_hit_rate || "0.0%"}
                  </p>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    {metricsData.geocode_cache_hit_count ?? 0}/{metricsData.geocode_call_count ?? 0} hits
                  </p>
                  <div className="mt-2.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Healthy
                    </span>
                  </div>
                </div>
              </div>

              {/* AUTH ERRORS */}
              <div className="rounded-2xl border border-slate-100 bg-[#f8fafc] p-4 flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">AUTH ERRORS</p>
                  <p className="text-xl font-bold text-slate-900 mt-0.5 leading-tight">
                    {metricsData.auth_error_count ?? 0}
                  </p>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">Provider faults</p>
                  <div className="mt-2.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Healthy
                    </span>
                  </div>
                </div>
              </div>

              {/* CHAT PERSISTENCE */}
              <div className="rounded-2xl border border-slate-100 bg-[#f8fafc] p-4 flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-teal-50 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5 text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">CHAT PERSISTENCE</p>
                  <p className="text-xl font-bold text-slate-900 mt-0.5 leading-tight">
                    {metricsData.chat_persistence_error_count ?? 0}
                  </p>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">Write failures</p>
                  <div className="mt-2.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Healthy
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Product Review Mix (1 col) */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Product review mix</h3>
          </div>

          {productTotal === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center font-medium">No products yet.</p>
          ) : (
            <div className="space-y-6 mt-6 my-auto">
              {productMix.map((mod) => (
                <div key={mod.name} className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-700">{mod.name}</span>
                    <span className="text-slate-900">
                      {mod.count} · {mod.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`${mod.color} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${mod.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="h-2" />
        </div>
      </div>

      {/* Alert for Pending approvals if any */}
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
