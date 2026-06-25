// src/app/approvals/page.tsx
"use client";

import React from "react";
import DashboardLayout from "../../components/DashboardLayout";
import ApprovalsTab from "../../components/ApprovalsTab";

export default function ApprovalsPage() {
  return (
    <DashboardLayout>
      <ApprovalsTab />
    </DashboardLayout>
  );
}
