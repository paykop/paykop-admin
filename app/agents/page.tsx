"use client";

import React from "react";
import DashboardLayout from "../../components/DashboardLayout";
import AgentsTab from "../../components/AgentsTab";

export default function AgentsPage() {
  return (
    <DashboardLayout>
      <AgentsTab />
    </DashboardLayout>
  );
}
