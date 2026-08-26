"use client";

import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProductCategoriesTab from "@/components/ProductCategoriesTab";

export default function ProductCategoriesPage() {
  return (
    <DashboardLayout>
      <ProductCategoriesTab />
    </DashboardLayout>
  );
}
