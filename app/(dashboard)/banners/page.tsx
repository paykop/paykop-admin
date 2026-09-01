"use client";

import React from "react";
import BannersTab from "@/components/BannersTab";
import RequireAdminPage from "@/components/RequireAdminPage";

export default function BannersPage() {
  return (
    <RequireAdminPage>
      <BannersTab />
    </RequireAdminPage>
  );
}
