"use client";

import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import CampaignsTab from "@/components/CampaignsTab";

export default function CampaignsPage() {
  return (
    <DashboardLayout>
      <CampaignsTab />
    </DashboardLayout>
  );
}
