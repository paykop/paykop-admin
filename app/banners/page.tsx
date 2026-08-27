"use client";

import React from "react";
import DashboardLayout from "../../components/DashboardLayout";
import BannersTab from "../../components/BannersTab";
import RequireAdminPage from "../../components/RequireAdminPage";

export default function BannersPage() {
  return (
    <DashboardLayout>
      <RequireAdminPage>
        <BannersTab />
      </RequireAdminPage>
    </DashboardLayout>
  );
}
