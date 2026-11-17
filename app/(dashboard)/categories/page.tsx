"use client";

import React from "react";
import ProductCategoriesTab from "@/components/ProductCategoriesTab";
import RequireAdminPage from "@/components/RequireAdminPage";

export default function ProductCategoriesPage() {
  return (
    <RequireAdminPage>
      <ProductCategoriesTab />
    </RequireAdminPage>
  );
}
