"use client";

import React from "react";
import DashboardLayout from "../../components/DashboardLayout";
import SupportTab from "../../components/SupportTab";
import RequireAdminPage from "../../components/RequireAdminPage";

export default function SupportPage() {
  return (
    <DashboardLayout>
      <RequireAdminPage>
        <SupportTab />
      </RequireAdminPage>
    </DashboardLayout>
  );
}
