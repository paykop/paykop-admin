// src/components/DashboardSidebar.tsx
"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { useUserStore } from "../store/useUserStore";
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  UserCog,
  CreditCard,
  Layers,
  Terminal,
  LogOut,
  Package,
  HeartHandshake,
  Droplet,
  FolderTree,
  LayoutGrid,
  Headset,
  Image as ImageIcon,
  ShieldCheck,
  X,
  Ticket,
  type LucideIcon,
} from "lucide-react";
import { canAccessRoute } from "@/lib/rbac";

interface DashboardSidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export default function DashboardSidebar({ mobileOpen = false, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { backendUser } = useUserStore();
  const role = backendUser?.role;

  const navItems: { id: string; label: string; icon: LucideIcon; href: string; badge?: number }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard, href: "/" },
    { id: "tickets", label: "Support Tickets", icon: Ticket, href: "/tickets" },
    { id: "products", label: "Products", icon: Package, href: "/products" },
    { id: "categories", label: "Product Categories", icon: FolderTree, href: "/categories" },
    { id: "banners", label: "Banners", icon: ImageIcon, href: "/banners" },
    { id: "users", label: "Users", icon: Users, href: "/users" },
    { id: "agents", label: "Agents", icon: UserCog, href: "/agents" },
    { id: "kyc", label: "KYC Submissions", icon: ShieldCheck, href: "/kyc" },
    { id: "support", label: "Staff Management", icon: Headset, href: "/support" },
    { id: "payments", label: "Payments", icon: CreditCard, href: "/payments" },
    { id: "subscriptions", label: "Subscriptions", icon: Layers, href: "/subscriptions" },
    { id: "campaigns", label: "Campaigns", icon: HeartHandshake, href: "/campaigns" },
    { id: "blood", label: "Blood Requests", icon: Droplet, href: "/blood" },
    { id: "service-categories", label: "Service Categories", icon: LayoutGrid, href: "/service-categories" },
    { id: "services", label: "Service Moderation", icon: CheckSquare, href: "/services" },
    { id: "logs", label: "System Logs", icon: Terminal, href: "/logs" },
  ];

  const visibleNav = navItems.filter((item) => canAccessRoute(role, item.href));
  const dbName = backendUser?.first_name || backendUser?.last_name
    ? `${backendUser.first_name || ""} ${backendUser.last_name || ""}`.trim()
    : "";
  const emailPrefix = backendUser?.email
    ? backendUser.email.split("@")[0]
    : "";

  const formattedEmailPrefix = emailPrefix
    ? emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1)
    : "";

  const adminName = dbName || formattedEmailPrefix || "Admin User";

  const adminRole = backendUser?.role
    ? backendUser.role === "admin"
      ? "Super admin"
      : `${backendUser.role.charAt(0).toUpperCase()}${backendUser.role.slice(1)}`
    : "Super admin";

  // Close drawer on route change (mobile)
  useEffect(() => {
    onClose?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const asideClasses = `
    w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen text-slate-300 shrink-0
    fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-out
    md:sticky md:top-0 md:translate-x-0 md:z-auto
    ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
  `;

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/50 md:hidden cursor-pointer"
          onClick={onClose}
        />
      )}

      <aside className={asideClasses}>
        <div className="p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-blue-500/20">
              P
            </div>
            <div>
              <h1 className="font-bold text-white tracking-wide text-[16px]">Paykop Admin</h1>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 pb-4 space-y-1">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={onClose}
                className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${isActive
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

        <div className="p-4 border-t border-slate-800 flex items-center justify-between gap-3 bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            {backendUser?.profile_picture_url ? (
              <Image
                src={backendUser.profile_picture_url}
                alt="Avatar"
                width={40}
                height={40}
                unoptimized
                className="w-10 h-10 rounded-full border border-slate-700 bg-slate-800 shrink-0 object-cover"
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

          <button
            onClick={logout}
            className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer shrink-0"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
}
