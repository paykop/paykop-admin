"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { isAdmin } from "@/lib/rbac";

interface RequireAdminPageProps {
  children: React.ReactNode;
}

export default function RequireAdminPage({ children }: RequireAdminPageProps) {
  const router = useRouter();
  const { backendUser, loading } = useUserStore();

  useEffect(() => {
    if (loading || !backendUser) return;
    if (!isAdmin(backendUser.role)) {
      router.replace("/unauthorized");
    }
  }, [backendUser, loading, router]);

  if (loading || !backendUser) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Checking access...</p>
      </div>
    );
  }

  if (!isAdmin(backendUser.role)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Redirecting...</p>
      </div>
    );
  }

  return <>{children}</>;
}
