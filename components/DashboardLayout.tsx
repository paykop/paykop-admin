// src/components/DashboardLayout.tsx
"use client";

import React, { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useUserStore } from "../store/useUserStore";
import DashboardSidebar from "./DashboardSidebar";
import { Loader2, ShieldAlert } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isLoaded, userId, getToken } = useAuth();
  const { backendUser, loading, error, fetchProfile } = useUserStore();

  useEffect(() => {
    if (isLoaded && userId && !backendUser && !error && !loading) {
      fetchProfile(getToken);
    }
  }, [isLoaded, userId, backendUser, error, loading]);

  // Loading spinner during auth or profile handshake
  if (!isLoaded || (loading && !backendUser)) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-slate-400 text-sm font-semibold tracking-wide">Syncing Security Handshake...</p>
      </div>
    );
  }

  // Access Denied / User doesn't exist in local database
  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-500 mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">Access Control Warning</h2>
          <p className="text-xs text-slate-400 leading-normal">{error}</p>
          <button
            onClick={() => fetchProfile(getToken)}
            className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl transition text-sm cursor-pointer shadow-lg shadow-blue-500/10"
          >
            Retry Handshake
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800">
      {/* Sidebar Navigation */}
      <DashboardSidebar />

      {/* Main Workspace Area */}
      <main className="flex-1 p-8 overflow-y-auto max-h-screen">
        <div className="max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
