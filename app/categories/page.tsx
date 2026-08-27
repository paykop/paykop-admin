"use client";

import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProductCategoriesTab from "@/components/ProductCategoriesTab";
import RequireAdminPage from "@/components/RequireAdminPage";

export default function ProductCategoriesPage() {
  return (
    <DashboardLayout>
      <RequireAdminPage>
        <ProductCategoriesTab />
      </RequireAdminPage>
    </DashboardLayout>
  );
}
