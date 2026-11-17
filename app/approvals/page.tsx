"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { getDefaultLandingPath } from "@/lib/rbac";

export default function ApprovalsPage() {
  const router = useRouter();
  const { backendUser } = useUserStore();

  useEffect(() => {
    const destination = backendUser
      ? getDefaultLandingPath(backendUser.role)
      : "/sign-in";
    router.replace(destination);
  }, [router, backendUser]);

  return null;
}
