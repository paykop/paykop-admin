"use client";

import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProductsTab from "@/components/ProductsTab";

export default function ProductsPage() {
  return (
    <DashboardLayout>
      <ProductsTab />
    </DashboardLayout>
  );
}
