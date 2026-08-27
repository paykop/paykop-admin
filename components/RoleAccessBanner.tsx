"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { isSupport } from "@/lib/rbac";

const PAGE_MESSAGES: Record<string, string> = {
  "/tickets":
    "You can view, reply to, and update the status of support tickets. Escalations requiring admin access should be forwarded to your team lead.",
  "/users":
    "You can search and view user profiles. Account changes such as suspend, verify, or role updates require admin access.",
  "/kyc":
    "You can review seller KYC submissions and approve or reject them as part of your support workflow.",
};

export default function RoleAccessBanner() {
  const pathname = usePathname();
  const role = useUserStore((s) => s.backendUser?.role);

  if (!isSupport(role)) return null;

  const message =
    PAGE_MESSAGES[pathname] ||
    "Your support role has limited access. Contact an administrator for actions outside your permissions.";

  return (
    <div className="mb-6 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 flex items-start gap-3">
      <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-bold text-sky-800">Support access</p>
        <p className="text-xs text-sky-700/90 mt-0.5 leading-relaxed">{message}</p>
      </div>
    </div>
  );
}
