// src/app/subscriptions/page.tsx
"use client";

import React from "react";
import DashboardLayout from "../../components/DashboardLayout";
import SubscriptionsTab from "../../components/SubscriptionsTab";

export default function SubscriptionsPage() {
  return (
    <DashboardLayout>
      <SubscriptionsTab />
    </DashboardLayout>
  );
}
