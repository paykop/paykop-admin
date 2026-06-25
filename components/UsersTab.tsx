// src/components/UsersTab.tsx
"use client";

import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  score: number;
  status: "Verified" | "Pending" | "Suspended";
}

export default function UsersTab() {
  const [users, setUsers] = useState<UserRecord[]>([
    {
      id: "u1",
      name: "Aarav Mehta",
      email: "aarav.mehta@email.com",
      role: "Buyer · Seller",
      score: 720,
      status: "Verified",
    },
    {
      id: "u2",
      name: "Dr. Neha Rao",
      email: "neha.rao@clinic.in",
      role: "Service provider",
      score: 910,
      status: "Verified",
    },
    {
      id: "u3",
      name: "Vikram Kohli",
      email: "vikram.k@email.com",
      role: "Seller",
      score: 340,
      status: "Pending",
    },
    {
      id: "u4",
      name: "Suresh P.",
      email: "suresh.p@email.com",
      role: "Buyer",
      score: 90,
      status: "Suspended",
    },
  ]);

  const toggleStatus = (id: string, action: "suspend" | "verify" | "restore") => {
    setUsers((prev) =>
      prev.map((user) => {
        if (user.id === id) {
          if (action === "suspend") return { ...user, status: "Suspended" };
          if (action === "verify" || action === "restore") return { ...user, status: "Verified" };
        }
        return user;
      })
    );
  };

  const getStatusStyle = (status: UserRecord["status"]) => {
    if (status === "Verified") {
      return "bg-emerald-500/10 border-emerald-500/20 text-emerald-600";
    }
    if (status === "Pending") {
      return "bg-amber-500/10 border-amber-500/20 text-amber-600";
    }
    return "bg-rose-500/10 border-rose-500/20 text-rose-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Users</h2>
        <p className="text-sm text-slate-500 mt-0.5">48,920 registered · manage status & verification</p>
      </div>

      {/* Directory Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="text-xs">
            <TableHeader className="bg-slate-50">
              <TableRow className="border-b border-slate-100 hover:bg-transparent">
                <TableHead className="p-4 pl-6 text-slate-400 font-bold uppercase tracking-wider text-[10px]">User</TableHead>
                <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Role</TableHead>
                <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Score</TableHead>
                <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Status</TableHead>
                <TableHead className="p-4 pr-6 text-right font-bold text-slate-400 uppercase tracking-wider text-[10px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {users.map((user) => {
                const initials = user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                const colors: Record<string, string> = {
                  u1: "bg-blue-600",
                  u2: "bg-indigo-600",
                  u3: "bg-amber-600",
                  u4: "bg-rose-600",
                };
                const avatarColor = colors[user.id] || "bg-slate-600";

                return (
                  <TableRow key={user.id} className="hover:bg-slate-50/50 transition border-b border-slate-100">
                    <TableCell className="p-4 pl-6 font-bold text-slate-800 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${avatarColor} text-white flex items-center justify-center font-bold text-xs shrink-0`}>
                        {initials}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-slate-800">{user.name}</span>
                        <span className="text-[11px] text-slate-400 font-semibold mt-0.5">{user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="p-4 text-slate-500 font-bold">{user.role}</TableCell>
                    <TableCell className="p-4 text-slate-800 font-bold font-mono">{user.score}</TableCell>
                    <TableCell className="p-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-bold ${getStatusStyle(user.status)}`}>
                        {user.status}
                      </span>
                    </TableCell>
                    <TableCell className="p-4 pr-6 text-right whitespace-nowrap">
                      {user.status === "Verified" && (
                        <Button
                          onClick={() => toggleStatus(user.id, "suspend")}
                          variant="outline"
                          className="h-8 px-3 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition font-bold text-xs cursor-pointer"
                        >
                          Suspend
                        </Button>
                      )}
                      {user.status === "Pending" && (
                        <Button
                          onClick={() => toggleStatus(user.id, "verify")}
                          variant="outline"
                          className="h-8 px-3 rounded-lg border border-blue-200 text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition font-bold text-xs cursor-pointer"
                        >
                          Verify
                        </Button>
                      )}
                      {user.status === "Suspended" && (
                        <Button
                          onClick={() => toggleStatus(user.id, "restore")}
                          variant="outline"
                          className="h-8 px-3 rounded-lg border border-blue-200 text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition font-bold text-xs cursor-pointer"
                        >
                          Restore
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
