"use client";

import React from "react";
import DashboardLayout from "../../components/DashboardLayout";
import TicketsTab from "../../components/TicketsTab";

export default function TicketsPage() {
  return (
    <DashboardLayout>
      <TicketsTab />
    </DashboardLayout>
  );
}
