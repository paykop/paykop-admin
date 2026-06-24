"use client";

import React, { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { apiRequest } from "../services/apiService";
import { profileResponseSchema, BackendUser } from "../schemas/userSchema";
import { Loader2, CheckCircle2, AlertCircle, ShieldAlert, User, Database, RefreshCw } from "lucide-react";

export default function BackendProfile() {
  const { isLoaded, userId, getToken } = useAuth();
  const { user: clerkUser } = useUser();
  const [backendUser, setBackendUser] = useState<BackendUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBackendProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("No authentication token found. Please sign in again.");
      }

      // Fetch the profile from our Go backend
      const response = await apiRequest("/api/v1/profile", profileResponseSchema, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setBackendUser(response.user);
    } catch (err: any) {
      console.error("Failed to fetch backend profile:", err);
      setError(err?.message || "Could not connect to Go backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && userId) {
      fetchBackendProfile();
    }
  }, [isLoaded, userId]);

  if (!isLoaded) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl text-slate-100 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Go Backend Integration</h2>
              <p className="text-xs text-slate-400">Verifying Clerk & DB Mirroring</p>
            </div>
          </div>
          <button
            onClick={fetchBackendProfile}
            disabled={loading}
            className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 disabled:opacity-50 transition duration-200"
            title="Refresh profile data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-400" : ""}`} />
          </button>
        </div>

        {/* Status Indicators */}
        <div className="space-y-4">
          {loading && !backendUser ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              <p className="text-xs text-slate-400">Querying Go server at port 8080...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/40 text-red-200 text-sm flex gap-3">
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-400">Connection Failed</p>
                <p className="text-xs text-red-300/80 mt-1 leading-normal">{error}</p>
                <button
                  onClick={fetchBackendProfile}
                  className="mt-3 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-1.5 rounded-md border border-red-500/30 font-medium transition"
                >
                  Retry Connection
                </button>
              </div>
            </div>
          ) : backendUser ? (
            <div className="space-y-4">
              {/* Connection Status Badge */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/10 border border-emerald-900/20 text-emerald-400 text-xs">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Authenticated Handshake OK
                </span>
                <span className="font-mono text-slate-500">HTTP 200</span>
              </div>

              {/* User Identity Details */}
              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-900 space-y-3.5">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-900">
                  {clerkUser?.imageUrl ? (
                    <img
                      src={clerkUser.imageUrl}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full border border-slate-800"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {backendUser.first_name || backendUser.last_name
                        ? `${backendUser.first_name} ${backendUser.last_name}`.trim()
                        : clerkUser?.fullName || "Clerk User"}
                    </p>
                    <p className="text-xs text-slate-500 font-mono">{backendUser.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">Email</span>
                    <span className="text-slate-200 font-medium break-all">{backendUser.email || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">DB Role</span>
                    <span className="inline-flex px-2 py-0.5 mt-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-semibold text-[10px] capitalize">
                      {backendUser.role}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Onboarded</span>
                    <span className={`font-semibold ${backendUser.is_onboarded ? "text-emerald-400" : "text-amber-400"}`}>
                      {backendUser.is_onboarded ? "Yes" : "No"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Subscription</span>
                    <span className={`font-semibold ${backendUser.has_subscription ? "text-emerald-400" : "text-slate-400"}`}>
                      {backendUser.has_subscription ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <Loader2 className="w-8 h-8 text-slate-500 animate-spin" />
              <p className="text-xs text-slate-400 font-mono">Awaiting verification...</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-900 text-[10px] text-slate-500 flex justify-between items-center">
        <span>Target: Go/Gin Middleware & Postgres</span>
        <span>SSL Secured</span>
      </div>
    </div>
  );
}
