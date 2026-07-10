// src/app/approvals/page.tsx
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ApprovalsPage() {
  const router = useRouter();
  
  useEffect(() => {
    // The approvals workflow was removed in API V4. Redirect to dashboard.
    router.push("/");
  }, [router]);

  return null;
}
