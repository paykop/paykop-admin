// app/service-categories/page.tsx
"use client";

import React from "react";
import DashboardLayout from "../../components/DashboardLayout";
import ServiceCategoriesTab from "../../components/ServiceCategoriesTab";

export default function ServiceCategoriesPage() {
  return (
    <DashboardLayout>
      <ServiceCategoriesTab />
    </DashboardLayout>
  );
}
