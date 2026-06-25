// src/app/payments/page.tsx
"use client";

import React from "react";
import DashboardLayout from "../../components/DashboardLayout";
import PaymentsTab from "../../components/PaymentsTab";

export default function PaymentsPage() {
  return (
    <DashboardLayout>
      <PaymentsTab />
    </DashboardLayout>
  );
}
