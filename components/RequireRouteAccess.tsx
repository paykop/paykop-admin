"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { canAccessRoute } from "@/lib/rbac";

interface RequireRouteAccessProps {
  children: React.ReactNode;
}

export default function RequireRouteAccess({ children }: RequireRouteAccessProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { backendUser, loading } = useUserStore();

  const allowed = backendUser ? canAccessRoute(backendUser.role, pathname) : false;

  useEffect(() => {
    if (loading || !backendUser) return;
    if (!canAccessRoute(backendUser.role, pathname)) {
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
