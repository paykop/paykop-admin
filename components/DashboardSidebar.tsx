// src/components/DashboardSidebar.tsx
"use client";

import React, { useEffect } from "react";
import SafeImage from "./SafeImage";
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
  Building2,
  Droplet,
  FolderTree,
  LayoutGrid,
  Headset,
  Image as ImageIcon,
  ShieldCheck,
  X,
  ChevronLeft,
  ChevronRight,
  Store,
  Ticket,
  Receipt,
  Banknote,
  Settings,
  Wrench,
  RotateCcw,
  Sprout,
  type LucideIcon,
} from "lucide-react";
import { canAccessRoute } from "@/lib/rbac";

interface DashboardSidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function DashboardSidebar({
  mobileOpen = false,
  onClose,
  collapsed = false,
  onToggleCollapse,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { backendUser } = useUserStore();
  const role = backendUser?.role;

  const navItems: { id: string; label: string; icon: LucideIcon; href: string; badge?: number }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard, href: "/" },
    { id: "tickets", label: "Support Tickets", icon: Ticket, href: "/tickets" },
    { id: "products", label: "Products", icon: Package, href: "/products" },
    { id: "categories", label: "Product Categories", icon: FolderTree, href: "/categories" },
    { id: "farm-sellers", label: "Farm Sellers", icon: Sprout, href: "/farm-sellers" },
    { id: "returns", label: "Returns & Disputes", icon: RotateCcw, href: "/returns" },
    { id: "banners", label: "Banners", icon: ImageIcon, href: "/banners" },
    { id: "users", label: "Users", icon: Users, href: "/users" },
    { id: "agents", label: "Agents", icon: UserCog, href: "/agents" },
    { id: "kyc", label: "KYC Submissions", icon: ShieldCheck, href: "/kyc" },
    { id: "support", label: "Staff Management", icon: Headset, href: "/support" },
    { id: "payments", label: "Payments", icon: CreditCard, href: "/payments" },
    { id: "commerce", label: "Commerce", icon: Store, href: "/commerce" },
    { id: "subscriptions", label: "Subscriptions", icon: Layers, href: "/subscriptions" },
    { id: "organizations", label: "Organizations", icon: Building2, href: "/organizations" },
    { id: "donations", label: "Donation Ledger", icon: Receipt, href: "/donations" },
    { id: "payouts", label: "Payout Settlements", icon: Banknote, href: "/payouts" },
    { id: "campaigns", label: "Campaigns", icon: HeartHandshake, href: "/campaigns" },
    { id: "blood", label: "Blood Requests", icon: Droplet, href: "/blood" },
    { id: "service-categories", label: "Service Categories", icon: LayoutGrid, href: "/service-categories" },
    { id: "services", label: "Service Moderation", icon: CheckSquare, href: "/services" },
    { id: "logs", label: "System Logs", icon: Terminal, href: "/logs" },
    { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
    { id: "devtools", label: "Dev Tools", icon: Wrench, href: "/devtools" },
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
    bg-slate-900 border-r border-slate-800 flex flex-col h-screen text-slate-300 shrink-0
    fixed inset-y-0 left-0 z-40 will-change-[width]
    transition-[width] duration-200 ease-out
    md:sticky md:top-0 md:translate-x-0 md:z-40
    ${mobileOpen ? "translate-x-0 shadow-2xl shadow-black/50" : "-translate-x-full md:translate-x-0"}
    ${collapsed ? "w-[72px]" : "w-64"}
  `;

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden cursor-pointer transition-opacity"
          onClick={onClose}
        />
      )}

      <aside className={asideClasses}>
        {/* Floating toggle button centered on the border line between sidebar and header */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden md:flex absolute -right-3.5 top-[18px] z-50 w-7 h-7 rounded-full bg-slate-900 border border-slate-700 hover:border-blue-500 hover:bg-slate-800 text-slate-300 hover:text-white items-center justify-center shadow-md shadow-black/50 transition-transform duration-150 hover:scale-110 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/40 group"
          aria-label={collapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"}
          title={collapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
          )}
        </button>

        {/* Top Header of Sidebar */}
        <div className="h-16 px-4 flex items-center justify-between shrink-0 border-b border-slate-800/60 overflow-hidden">
          <Link href="/" className="flex items-center shrink-0 group">
            <Image
              src="/brand/paykop-icon.png"
              alt="Paykop"
              width={36}
              height={36}
              className="w-9 h-9 rounded-lg shadow-lg shadow-blue-500/20 shrink-0 group-hover:scale-105 transition-transform"
            />
            <h1
              className={`font-bold text-white tracking-wide text-[16px] whitespace-nowrap ml-3 transition-opacity duration-150 ${
                collapsed ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
            >
              Paykop Admin
            </h1>
          </Link>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 active:bg-slate-700 transition cursor-pointer"
            aria-label="Close sidebar"
            title="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links with custom sleek scrollbar */}
        <nav
          className="flex-1 overflow-y-auto overflow-x-hidden custom-sidebar-scrollbar px-3 pb-4 space-y-1"
          data-tour="sidebar-nav"
        >
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={onClose}
                title={collapsed ? item.label : undefined}
                className={`h-11 flex items-center px-3 rounded-lg text-sm font-medium transition-colors duration-150 cursor-pointer relative group overflow-hidden ${
                  isActive
                    ? "bg-slate-800 text-white shadow-sm ring-1 ring-white/10"
                    : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 transition-colors duration-150 ${
                    isActive ? "text-blue-400" : "text-slate-400 group-hover:text-slate-200"
                  }`}
                />
                <span
                  className={`truncate whitespace-nowrap transition-opacity duration-150 ml-3 ${
                    collapsed ? "opacity-0 pointer-events-none" : "opacity-100"
                  }`}
                >
                  {item.label}
                </span>

                {/* Badge when expanded */}
                {item.badge !== undefined && item.badge > 0 && !collapsed && (
                  <span className="ml-auto bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0">
                    {item.badge}
                  </span>
                )}

                {/* Badge pip when collapsed */}
                {item.badge !== undefined && item.badge > 0 && collapsed && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-slate-900" />
                )}

                {/* Floating tooltip on hover when collapsed */}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-950 text-white text-xs font-semibold rounded-md shadow-xl border border-slate-800 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap z-50">
                    {item.label}
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Profile & Sign out */}
        <div className="h-16 border-t border-slate-800 flex items-center justify-between px-3 bg-slate-900/60 shrink-0 overflow-hidden">
          <div className="flex items-center shrink-0 min-w-0">
            {backendUser?.profile_picture_url ? (
              <SafeImage
                src={backendUser.profile_picture_url}
                alt="Avatar"
                width={36}
                height={36}
                className="w-9 h-9 rounded-full border border-slate-700 bg-slate-800 shrink-0 object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-xs shrink-0">
                {adminName.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div
              className={`text-left whitespace-nowrap ml-3 transition-opacity duration-150 overflow-hidden ${
                collapsed ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
            >
              <p className="text-sm font-semibold text-white truncate max-w-[110px]" title={adminName}>
                {adminName}
              </p>
              <p className="text-[11px] text-slate-500 truncate">{adminRole}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className={`p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-opacity duration-150 cursor-pointer shrink-0 ${
              collapsed ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
}
