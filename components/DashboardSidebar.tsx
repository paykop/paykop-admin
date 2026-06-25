// src/components/DashboardSidebar.tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { useUserStore } from "../store/useUserStore";
import { useDashboardStore } from "../store/useDashboardStore";
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  CreditCard,
  Layers,
  LogOut
} from "lucide-react";

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { user: clerkUser } = useUser();
  const { backendUser } = useUserStore();
  const campaigns = useDashboardStore((state) => state.campaigns);

  const pendingApprovalsCount = campaigns.filter((c) => c.status === "pending").length;

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard, href: "/" },
    { id: "approvals", label: "Approvals", icon: CheckSquare, href: "/approvals", badge: pendingApprovalsCount },
    { id: "users", label: "Users", icon: Users, href: "/users" },
    { id: "payments", label: "Payments", icon: CreditCard, href: "/payments" },
    { id: "subscriptions", label: "Subscriptions", icon: Layers, href: "/subscriptions" },
  ];

  // Robust real data extraction: Clerk name > DB name > email prefix > fallback
  const clerkName = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") || clerkUser?.fullName;
  const dbName = backendUser?.first_name || backendUser?.last_name
    ? `${backendUser.first_name} ${backendUser.last_name}`.trim()
    : "";
  const emailPrefix = clerkUser?.primaryEmailAddress?.emailAddress
    ? clerkUser.primaryEmailAddress.emailAddress.split("@")[0]
    : "";
  
  // Format email prefix for capitalization (e.g., maha -> Maha)
  const formattedEmailPrefix = emailPrefix
    ? emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1)
    : "";

  const adminName = clerkName || dbName || formattedEmailPrefix || "Admin User";

  const adminRole = backendUser?.role
    ? backendUser.role === "admin"
      ? "Super admin"
      : `${backendUser.role.charAt(0).toUpperCase()}${backendUser.role.slice(1)}`
    : "Super admin";

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0 text-slate-300 shrink-0">
      {/* Header / Logo */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-blue-500/20">
            C
          </div>
          <div>
            <h1 className="font-bold text-white tracking-wide text-[16px]">Connect Admin</h1>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="mt-8 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            // Root path maps to overview, otherwise exact prefix match
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Profile / Footer */}
      <div className="p-4 border-t border-slate-800 flex items-center justify-between gap-3 bg-slate-900/60">
        <div className="flex items-center gap-3 overflow-hidden">
          {clerkUser?.imageUrl ? (
            <img
              src={clerkUser.imageUrl}
              alt="Avatar"
              className="w-10 h-10 rounded-full border border-slate-700 bg-slate-800 shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-sm shrink-0">
              {adminName.substring(0, 2).toUpperCase()}
            </div>
          )}
          <div className="text-left overflow-hidden">
            <p className="text-sm font-semibold text-white truncate max-w-[120px]" title={adminName}>
              {adminName}
            </p>
            <p className="text-[11px] text-slate-500 truncate">{adminRole}</p>
          </div>
        </div>

        <SignOutButton>
          <button className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer shrink-0" title="Sign Out">
            <LogOut className="w-4 h-4" />
          </button>
        </SignOutButton>
      </div>
    </aside>
  );
}
