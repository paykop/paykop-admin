// src/components/ApprovalsTab.tsx
"use client";

import React, { useState } from "react";
import { useDashboardStore } from "../store/useDashboardStore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { Check, X, Heart } from "lucide-react";

export default function ApprovalsTab() {
  const [subTab, setSubTab] = useState<"pending" | "approved">("pending");
  const campaigns = useDashboardStore((state) => state.campaigns);
  const onApprove = useDashboardStore((state) => state.approveCampaign);
  const onReject = useDashboardStore((state) => state.rejectCampaign);

  const pendingList = campaigns.filter((c) => c.status === "pending");
  const approvedList = campaigns.filter((c) => c.status === "approved");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Donation approvals</h2>
        <p className="text-sm text-slate-500 mt-0.5">Campaigns become public only after you approve them.</p>
      </div>

      {/* Tabs Row */}
      <div className="flex gap-2">
        <button
          onClick={() => setSubTab("pending")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            subTab === "pending"
              ? "bg-amber-500/10 border border-amber-500/20 text-amber-600"
              : "bg-slate-100 hover:bg-slate-200 text-slate-600"
          }`}
        >
          <span>⏳ {pendingList.length} pending</span>
        </button>
        <button
          onClick={() => setSubTab("approved")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            subTab === "approved"
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600"
              : "bg-slate-100 hover:bg-slate-200 text-slate-600"
          }`}
        >
          <span>✅ {128 + approvedList.length} approved</span>
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {subTab === "pending" ? (
          pendingList.length === 0 ? (
            <div className="p-10 text-center flex flex-col items-center justify-center gap-2">
              <span className="text-3xl">🎉</span>
              <p className="text-slate-800 font-bold text-sm">All caught up!</p>
              <p className="text-xs text-slate-400">No campaigns are waiting for approval right now.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="text-xs">
                <TableHeader className="bg-slate-50">
                  <TableRow className="border-b border-slate-100 hover:bg-transparent">
                    <TableHead className="p-4 pl-6 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Campaign</TableHead>
                    <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Organiser</TableHead>
                    <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Goal</TableHead>
                    <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Submitted</TableHead>
                    <TableHead className="p-4 pr-6 text-right text-slate-400 font-bold uppercase tracking-wider text-[10px]">Decision</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-100">
                  {pendingList.map((c) => (
                    <TableRow key={c.id} className="hover:bg-slate-50/50 transition border-b border-slate-100">
                      <TableCell className="p-4 pl-6 font-bold text-slate-800 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <Heart className="w-4 h-4" />
                        </div>
                        <span className="truncate max-w-[250px]">{c.name}</span>
                      </TableCell>
                      <TableCell className="p-4 text-slate-500 font-semibold">{c.organiser}</TableCell>
                      <TableCell className="p-4 text-slate-800 font-bold">{c.goal}</TableCell>
                      <TableCell className="p-4 text-slate-400 font-semibold">{c.submitted}</TableCell>
                      <TableCell className="p-4 pr-6 text-right space-x-2 whitespace-nowrap">
                        <Button
                          onClick={() => onReject(c.id)}
                          variant="outline"
                          className="h-8 px-3 rounded-lg border border-red-200 hover:bg-red-50 text-red-500 font-bold transition text-xs inline-flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </Button>
                        <Button
                          onClick={() => onApprove(c.id)}
                          className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition text-xs inline-flex items-center gap-1 cursor-pointer shadow-sm shadow-emerald-500/10 border-transparent"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )
        ) : (
          <div className="overflow-x-auto">
            <Table className="text-xs">
              <TableHeader className="bg-slate-50">
                <TableRow className="border-b border-slate-100 hover:bg-transparent">
                  <TableHead className="p-4 pl-6 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Campaign</TableHead>
                  <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Organiser</TableHead>
                  <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Goal</TableHead>
                  <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Submitted</TableHead>
                  <TableHead className="p-4 pr-6 text-right text-slate-400 font-bold uppercase tracking-wider text-[10px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {/* Seed static approved list */}
                <TableRow className="hover:bg-slate-50/50 transition border-b border-slate-100">
                  <TableCell className="p-4 pl-6 font-bold text-slate-800 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Heart className="w-4 h-4" />
                    </div>
                    <span>Drinking water supply for village</span>
                  </TableCell>
                  <TableCell className="p-4 text-slate-500 font-semibold">Gram Vikas Trust</TableCell>
                  <TableCell className="p-4 text-slate-800 font-bold">₹3,00,000</TableCell>
                  <TableCell className="p-4 text-slate-400 font-semibold">Jun 18</TableCell>
                  <TableCell className="p-4 pr-6 text-right">
                    <span className="inline-flex px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-bold">
                      Approved
                    </span>
                  </TableCell>
                </TableRow>

                {/* Dynamically approved ones */}
                {approvedList.map((c) => (
                  <TableRow key={c.id} className="hover:bg-slate-50/50 transition border-b border-slate-100">
                    <TableCell className="p-4 pl-6 font-bold text-slate-800 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Heart className="w-4 h-4" />
                      </div>
                      <span>{c.name}</span>
                    </TableCell>
                    <TableCell className="p-4 text-slate-500 font-semibold">{c.organiser}</TableCell>
                    <TableCell className="p-4 text-slate-800 font-bold">{c.goal}</TableCell>
                    <TableCell className="p-4 text-slate-400 font-semibold">{c.submitted}</TableCell>
                    <TableCell className="p-4 pr-6 text-right">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-bold">
                        Approved
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
