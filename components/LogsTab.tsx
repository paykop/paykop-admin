// src/components/LogsTab.tsx
"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/lib/useAuth";
import { useAdminLogsStore } from "../store/useAdminLogsStore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Loader2, Activity } from "lucide-react";

export default function LogsTab() {
  const { getToken } = useAuth();
  const { logs, loading, fetchLogs } = useAdminLogsStore();

  useEffect(() => {
    fetchLogs(getToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getToken]);

  if (loading && logs.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const getActionColor = (action: string) => {
    if (action.includes("CREATE") || action.includes("APPROVE")) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (action.includes("UPDATE")) return "text-blue-600 bg-blue-50 border-blue-200";
    if (action.includes("DELETE") || action.includes("REJECT")) return "text-rose-600 bg-rose-50 border-rose-200";
    return "text-slate-600 bg-slate-50 border-slate-200";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Activity className="w-6 h-6 text-slate-500" />
          System Audit Logs
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">Immutable record of all administrative and system actions.</p>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="text-xs">
            <TableHeader className="bg-slate-50">
              <TableRow className="border-b border-slate-100 hover:bg-transparent">
                <TableHead className="p-4 pl-6 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Timestamp</TableHead>
                <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Action</TableHead>
                <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Actor ID</TableHead>
                <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Target Entity</TableHead>
                <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Changes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="p-10 text-center flex flex-col items-center justify-center gap-2 text-slate-500">
                    <Activity className="w-8 h-8 text-slate-300" />
                    <span className="font-bold">No Audit Logs Found</span>
                    <span className="text-[11px]">System activity will appear here as it happens.</span>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-slate-50/50 transition border-b border-slate-100">
                    <TableCell className="p-4 pl-6 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="p-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full border text-[9px] font-bold tracking-wider ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </TableCell>
                    <TableCell className="p-4 text-slate-700 font-mono text-[11px] truncate max-w-[150px]" title={log.actor_id}>
                      {log.actor_id}
                    </TableCell>
                    <TableCell className="p-4 text-slate-700 font-semibold">
                      {log.entity_type} <span className="text-slate-400 font-mono text-[10px]">#{log.entity_id}</span>
                    </TableCell>
                    <TableCell className="p-4 text-[10px] text-slate-500 max-w-[200px] truncate">
                      {log.old_state && log.new_state ? (
                        <>
                          <span className="line-through text-rose-400 mr-1">{log.old_state}</span>
                          <span className="text-emerald-500 font-semibold">{log.new_state}</span>
                        </>
                      ) : log.new_state ? (
                        <span className="text-emerald-500 font-semibold">Created: {log.new_state}</span>
                      ) : (
                        <span className="text-slate-400 italic">No details recorded</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
