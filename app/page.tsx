// src/app/page.tsx
"use client";

import React from "react";
import DashboardLayout from "../components/DashboardLayout";
import OverviewTab from "../components/OverviewTab";

export default function HomePage() {
  return (
    <DashboardLayout>
      <OverviewTab />
    </DashboardLayout>
  );
}
