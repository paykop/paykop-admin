"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { resolveRouteForRole } from "@/lib/rbac";

interface RequireRouteAccessProps {
  children: React.ReactNode;
}

export default function RequireRouteAccess({ children }: RequireRouteAccessProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { backendUser, loading } = useUserStore();

  const resolution = backendUser
    ? resolveRouteForRole(backendUser.role, pathname)
    : "deny";
  const allowed = resolution === "allow";

  useEffect(() => {
    if (loading || !backendUser) return;
    const routeResolution = resolveRouteForRole(backendUser.role, pathname);
    if (routeResolution === "redirect:/tickets") {
      router.replace("/tickets");
      return;
    }
    if (routeResolution === "deny") {
      router.replace("/unauthorized");
    }
  }, [backendUser, loading, pathname, router]);

  if (loading || !backendUser) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Checking access...</p>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Redirecting...</p>
      </div>
    );
  }

  return <>{children}</>;
}
