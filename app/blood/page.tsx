"use client";

import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import BloodTab from "@/components/BloodTab";

export default function BloodPage() {
  return (
    <DashboardLayout>
      <BloodTab />
    </DashboardLayout>
  );
}
