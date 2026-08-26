// src/components/DashboardLayout.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { useUserStore } from "../store/useUserStore";
import DashboardSidebar from "./DashboardSidebar";
import { Loader2, ShieldAlert, Menu } from "lucide-react";
import NotificationPopover from "./NotificationPopover";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { backendUser, loading, error, fetchProfile } = useUserStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (isLoaded && isSignedIn && !backendUser && !error && !loading) {
      fetchProfile(getToken);
    }
  }, [isLoaded, isSignedIn, backendUser, error, loading, fetchProfile, getToken]);

  if (isLoaded && !isSignedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-slate-400 text-sm font-semibold tracking-wide">Redirecting to sign-in...</p>
      </div>
    );
  }

  if (!isLoaded || loading || (!backendUser && !error)) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-slate-400 text-sm font-semibold tracking-wide">Syncing Security Handshake...</p>
      </div>
    );
  }

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
      <DashboardSidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 overflow-y-auto max-h-screen flex flex-col min-w-0">
        <header className="h-14 md:h-16 border-b border-slate-200 bg-white/80 backdrop-blur px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 shrink-0 shadow-sm gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 -ml-1 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer shrink-0"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate hidden sm:inline">
              Live Security Handshake Active
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider sm:hidden">
              Live
            </span>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <NotificationPopover />
          </div>
        </header>

        <div className="flex-1 p-4 md:p-8">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
