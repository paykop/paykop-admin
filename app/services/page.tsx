// src/app/services/page.tsx
"use client";

import React from "react";
import DashboardLayout from "../../components/DashboardLayout";
import ServicesTab from "../../components/ServicesTab";

export default function ServicesPage() {
  return (
    <DashboardLayout>
      <ServicesTab />
    </DashboardLayout>
  );
}
