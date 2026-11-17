"use client";

import React from "react";
import SupportTab from "@/components/SupportTab";
import RequireAdminPage from "@/components/RequireAdminPage";

export default function SupportPage() {
  return (
    <RequireAdminPage>
      <SupportTab />
    </RequireAdminPage>
  );
}
