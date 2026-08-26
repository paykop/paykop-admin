"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { Terminal, Play, Loader2 } from "lucide-react";
import {
  testAdminDashboard,
  fetchServerHealth,
  fetchUserPermissions,
} from "../services/userService";
import { ApiError } from "../services/apiService";

interface ConsoleLog {
  timestamp: string;
  method: string;
  url: string;
  status: string;
  payload: any;
  isError: boolean;
}

export default function ApiConsole() {
  const { getToken } = useAuth();
  const [running, setRunning] = useState<string | null>(null);
  const [logs, setLogs] = useState<ConsoleLog[]>([]);

  const addLog = (method: string, url: string, status: string, payload: any, isError = false) => {
    const newLog: ConsoleLog = {
      timestamp: new Date().toLocaleTimeString(),
      method,
      url,
      status,
      payload,
      isError,
    };
    setLogs((prev) => [newLog, ...prev].slice(0, 10)); // keep last 10 logs
  };

  const handleTest = async (testName: string) => {
    setRunning(testName);
    
    try {
      if (testName === "health") {
        const res = await fetchServerHealth();
        addLog("GET", "/health", "200 OK", res);
      } else {
        const token = await getToken();
        if (!token) {
          addLog("UNKNOWN", "/api/v1/...", "401 Unauthorized", { error: "No authentication session token found." }, true);
          setRunning(null);
          return;
        }

        if (testName === "admin-dashboard") {
          const res = await testAdminDashboard(token);
          addLog("GET", "/api/v1/admin/dashboard", "200 OK", res);
        } else if (testName === "permissions") {
          const res = await fetchUserPermissions(token);
          addLog("GET", "/api/v1/users/me/permissions", "200 OK", res);
        }
      }
    } catch (err: any) {
      const isHealth = testName === "health";
      const method = "GET";
      const url = isHealth 
        ? "/health" 
        : testName === "admin-dashboard" 
          ? "/api/v1/admin/dashboard" 
          : "/api/v1/users/me/permissions";

      if (err instanceof ApiError) {
        let statusString = `${err.status}`;
        if (err.status === 403) statusString += " Forbidden";
        else if (err.status === 401) statusString += " Unauthorized";
        else if (err.status === 400) statusString += " Bad Request";
        else if (err.status === 500) statusString += " Internal Server Error";
        
        addLog(method, url, statusString, err.info || { error: err.message }, true);
      } else {
        addLog(method, url, "Network Error", { error: err?.message || "Failed to contact Go backend server." }, true);
      }
    } finally {
      setRunning(null);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl text-slate-100 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Admin Action Console</h2>
              <p className="text-xs text-slate-400">Query Gated & Public Admin APIs</p>
            </div>
          </div>
          {logs.length > 0 && (
            <button
              onClick={clearLogs}
              className="text-[10px] text-slate-500 hover:text-slate-300 font-semibold px-2 py-1 rounded bg-slate-950 border border-slate-800 transition cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Action Panel */}
        <div className="space-y-2.5 mb-5">
          {/* Server Health (Public) */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-900 hover:border-slate-800 transition group">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">System Health Status</span>
              <span className="text-[10px] text-slate-500 font-mono">GET /health</span>
            </div>
            <button
              onClick={() => handleTest("health")}
              disabled={running !== null}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold hover:bg-emerald-500 hover:text-slate-950 transition duration-200 disabled:opacity-50 cursor-pointer"
            >
              {running === "health" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3 h-3 fill-current" />
              )}
              Run
            </button>
          </div>

          {/* User Capabilities (Protected Auth) */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-900 hover:border-slate-800 transition group">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">Verify DB Claims</span>
              <span className="text-[10px] text-slate-500 font-mono">GET /users/me/permissions</span>
            </div>
            <button
              onClick={() => handleTest("permissions")}
              disabled={running !== null}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold hover:bg-amber-500 hover:text-slate-950 transition duration-200 disabled:opacity-50 cursor-pointer"
            >
              {running === "permissions" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3 h-3 fill-current" />
              )}
              Run
            </button>
          </div>

          {/* Admin Dashboard (Gated Admin) */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-900 hover:border-slate-800 transition group">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">Admin Command center</span>
              <span className="text-[10px] text-slate-500 font-mono">GET /admin/dashboard</span>
            </div>
            <button
              onClick={() => handleTest("admin-dashboard")}
              disabled={running !== null}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold hover:bg-rose-500 hover:text-slate-950 transition duration-200 disabled:opacity-50 cursor-pointer"
            >
              {running === "admin-dashboard" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3 h-3 fill-current" />
              )}
              Run
            </button>
          </div>
        </div>

        {/* Console Log Area */}
        <div className="relative">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2 font-mono">
            Console Output
          </span>
          <div className="w-full h-[220px] bg-slate-950 border border-slate-900 rounded-xl p-4 font-mono text-[11px] overflow-y-auto space-y-3.5 scrollbar-thin scrollbar-thumb-slate-800">
            {logs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-600 italic">
                No logs recorded. Click "Run" on any Admin API above to test middleware gates.
              </div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="border-b border-slate-900/60 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                    <span>{log.timestamp}</span>
                    <span className={`px-1.5 py-0.5 rounded font-bold ${
                      log.isError ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"
                    }`}>
                      {log.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-emerald-500 font-bold">{log.method}</span>
                    <span className="text-slate-300">{log.url}</span>
                  </div>
                  <pre className={`p-2 rounded bg-slate-900/40 text-[10px] overflow-x-auto ${
                    log.isError ? "text-red-300/90 border border-red-500/5" : "text-slate-400"
                  }`}>
                    {JSON.stringify(log.payload, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-900 text-[10px] text-slate-500 flex justify-between items-center">
        <span>Gated by Gin Engine Roles & Claims</span>
        <span>Output JSON</span>
      </div>
    </div>
  );
}
