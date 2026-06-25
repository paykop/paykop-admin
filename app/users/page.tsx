// src/app/users/page.tsx
"use client";

import React from "react";
import DashboardLayout from "../../components/DashboardLayout";
import UsersTab from "../../components/UsersTab";

export default function UsersPage() {
  return (
    <DashboardLayout>
      <UsersTab />
    </DashboardLayout>
  );
}
