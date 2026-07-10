"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useAdminBloodStore } from "../store/useAdminBloodStore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { Droplet, Loader2, Check, X, CheckCircle } from "lucide-react";

export default function BloodTab() {
  const { getToken } = useAuth();
  const { requests, loading, fetchAdminBloodRequests, updateAdminBloodRequestStatus } = useAdminBloodStore();
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    fetchAdminBloodRequests(getToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getToken]);

  const handleUpdateStatus = async (id: number, status: string) => {
    setProcessingId(id);
    await updateAdminBloodRequestStatus(getToken, id, status);
    setProcessingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Blood Donation Requests</h2>
        <p className="text-sm text-slate-500 mt-0.5">Moderate and update statuses for urgent blood requests.</p>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading && requests.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : requests.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center justify-center gap-2">
            <Droplet className="w-10 h-10 text-slate-300" />
            <p className="text-slate-800 font-bold text-sm">No blood requests found</p>
            <p className="text-xs text-slate-400">All caught up!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="text-xs">
              <TableHeader className="bg-slate-50">
                <TableRow className="border-b border-slate-100 hover:bg-transparent">
                  <TableHead className="p-4 pl-6 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Patient Info</TableHead>
                  <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Hospital & Contact</TableHead>
                  <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Status</TableHead>
                  <TableHead className="p-4 pr-6 text-right text-slate-400 font-bold uppercase tracking-wider text-[10px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {requests.map((r) => (
                  <TableRow key={r.id} className="hover:bg-slate-50/50 transition border-b border-slate-100">
                    <TableCell className="p-4 pl-6 font-bold text-slate-800 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                        {r.blood_type}
                      </div>
                      <div>
                        <div className="truncate max-w-[200px] text-slate-800 font-bold">{r.patient_name}</div>
                        <div className="text-[10px] text-slate-500 font-semibold">{r.units_needed} unit(s) needed</div>
                      </div>
                    </TableCell>
                    <TableCell className="p-4">
                      <div className="text-slate-800 font-semibold truncate max-w-[250px]">{r.hospital}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{r.contact_phone}</div>
                    </TableCell>
                    <TableCell className="p-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                        r.status === "approved" ? "bg-blue-50 text-blue-600 border border-blue-200" :
                        r.status === "fulfilled" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" :
                        r.status === "pending" ? "bg-amber-50 text-amber-600 border border-amber-200" :
                        "bg-red-50 text-red-600 border border-red-200"
                      }`}>
                        {r.status}
                      </span>
                    </TableCell>
                    <TableCell className="p-4 pr-6 text-right space-x-2 whitespace-nowrap">
                      {processingId === r.id ? (
                        <Loader2 className="w-4 h-4 animate-spin inline-block text-red-500" />
                      ) : (
                        <div className="flex justify-end gap-2">
                           {r.status === "pending" && (
                            <Button
                              onClick={() => handleUpdateStatus(r.id, "approved")}
                              variant="outline"
                              className="h-7 px-2 rounded border border-blue-200 hover:bg-blue-50 text-blue-600 text-[10px] inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3 h-3" /> Approve
                            </Button>
                          )}
                           {r.status === "pending" && (
                            <Button
                              onClick={() => handleUpdateStatus(r.id, "rejected")}
                              variant="outline"
                              className="h-7 px-2 rounded border border-red-200 hover:bg-red-50 text-red-600 text-[10px] inline-flex items-center gap-1 cursor-pointer"
                            >
                              <X className="w-3 h-3" /> Reject
                            </Button>
                          )}
                          {r.status === "approved" && (
                            <Button
                              onClick={() => handleUpdateStatus(r.id, "fulfilled")}
                              variant="outline"
                              className="h-7 px-2 rounded border border-emerald-200 hover:bg-emerald-50 text-emerald-600 text-[10px] inline-flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle className="w-3 h-3" /> Mark Fulfilled
                            </Button>
                          )}
                        </div>
                      )}
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
