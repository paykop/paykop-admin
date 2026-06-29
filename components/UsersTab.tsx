// src/components/UsersTab.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useAdminUsersStore } from "../store/useAdminUsersStore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Loader2, Edit } from "lucide-react";

export default function UsersTab() {
  const { getToken } = useAuth();
  
  const { 
    users, 
    loading, 
    fetchAdminUsers, 
    suspendAdminUser, 
    verifyAdminUser,
    selectedUser,
    detailsLoading,
    fetchUserDetail,
    updateUserDetails,
    clearSelectedUser
  } = useAdminUsersStore();

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ first_name: "", last_name: "", role: "" });

  useEffect(() => {
    fetchAdminUsers(getToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getToken]);

  useEffect(() => {
    if (selectedUser) {
      setEditForm({
        first_name: selectedUser.first_name || "",
        last_name: selectedUser.last_name || "",
        role: (selectedUser.role || "buyer").toLowerCase()
      });
    }
  }, [selectedUser]);

  const handleToggleStatus = async (id: string, action: "suspend" | "unsuspend" | "verify") => {
    setProcessingId(id);
    if (action === "suspend") {
      await suspendAdminUser(getToken, id, true);
    } else if (action === "unsuspend") {
      await suspendAdminUser(getToken, id, false);
    } else {
      await verifyAdminUser(getToken, id);
    }
    setProcessingId(null);
  };

  const handleOpenEdit = async (id: string) => {
    setModalOpen(true);
    await fetchUserDetail(getToken, id);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    clearSelectedUser();
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setProcessingId("save-edit");
    try {
      const payload: any = {
        first_name: editForm.first_name,
        last_name: editForm.last_name,
      };

      const newRole = editForm.role?.trim().toLowerCase();
      const oldRole = selectedUser.role?.trim().toLowerCase();
      
      if (newRole && newRole !== oldRole) {
        payload.role = newRole;
      }

      await updateUserDetails(getToken, selectedUser.id, payload);
      setModalOpen(false);
      clearSelectedUser();
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusStyle = (isOnboarded: boolean) => {
    if (isOnboarded) {
      return "bg-emerald-500/10 border-emerald-500/20 text-emerald-600";
    }
    return "bg-amber-500/10 border-amber-500/20 text-amber-600";
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Users</h2>
        <p className="text-sm text-slate-500 mt-0.5">Manage status, verification, and roles</p>
      </div>

      {/* Directory Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="text-xs">
            <TableHeader className="bg-slate-50">
              <TableRow className="border-b border-slate-100 hover:bg-transparent">
                <TableHead className="p-4 pl-6 text-slate-400 font-bold uppercase tracking-wider text-[10px]">User</TableHead>
                <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Role</TableHead>
                <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Status</TableHead>
                <TableHead className="p-4 pr-6 text-right font-bold text-slate-400 uppercase tracking-wider text-[10px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {users.map((user) => {
                const name = `${user.first_name} ${user.last_name}`.trim() || "Unknown";
                const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                const colorMap = ["bg-blue-600", "bg-indigo-600", "bg-amber-600", "bg-rose-600", "bg-emerald-600"];
                const avatarColor = colorMap[user.id.charCodeAt(user.id.length - 1) % colorMap.length] || "bg-slate-600";

                return (
                  <TableRow key={user.id} className="hover:bg-slate-50/50 transition border-b border-slate-100">
                    <TableCell className="p-4 pl-6 font-bold text-slate-800 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${avatarColor} text-white flex items-center justify-center font-bold text-xs shrink-0`}>
                        {initials}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-slate-800">{name}</span>
                        <span className="text-[11px] text-slate-400 font-semibold mt-0.5">{user.email || user.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell className="p-4 text-slate-500 font-bold capitalize">{user.role}</TableCell>
                    <TableCell className="p-4">
                      <div className="flex flex-wrap gap-1">
                        <span className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-bold ${getStatusStyle(user.is_onboarded)}`}>
                          {user.is_onboarded ? "Onboarded" : "Pending"}
                        </span>
                        {user.kyc_status && (
                          <span className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-bold ${
                            user.kyc_status === "verified" ? "bg-blue-500/10 border-blue-500/20 text-blue-600" :
                            "bg-slate-500/10 border-slate-500/20 text-slate-600"
                          } capitalize`}>
                            KYC: {user.kyc_status}
                          </span>
                        )}
                        {user.is_suspended && (
                          <span className="inline-flex px-2 py-0.5 rounded-full border text-[10px] font-bold bg-rose-500/10 border-rose-500/20 text-rose-600">
                            Suspended
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="p-4 pr-6 text-right whitespace-nowrap flex justify-end gap-2 items-center h-[72px]">
                      {processingId === user.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                      ) : (
                        <>
                          <Button
                            onClick={() => handleOpenEdit(user.id)}
                            variant="ghost"
                            className="h-8 px-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                            title="Edit User"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>

                          {user.kyc_status !== "verified" && (
                            <Button
                              onClick={() => handleToggleStatus(user.id, "verify")}
                              variant="outline"
                              className="h-8 px-3 rounded-lg border border-blue-200 text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition font-bold text-xs cursor-pointer"
                            >
                              Verify
                            </Button>
                          )}
                          {!user.is_suspended ? (
                            <Button
                              onClick={() => handleToggleStatus(user.id, "suspend")}
                              variant="outline"
                              className="h-8 px-3 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition font-bold text-xs cursor-pointer"
                            >
                              Suspend
                            </Button>
                          ) : (
                            <Button
                              onClick={() => handleToggleStatus(user.id, "unsuspend")}
                              variant="outline"
                              className="h-8 px-3 rounded-lg border border-amber-200 text-amber-600 hover:text-amber-700 hover:bg-amber-50 transition font-bold text-xs cursor-pointer"
                            >
                              Unsuspend
                            </Button>
                          )}
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="p-4 text-center text-slate-500">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit User Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Edit User Profile</DialogTitle>
          </DialogHeader>
          
          {detailsLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : selectedUser ? (
            <form onSubmit={handleSaveEdit} className="space-y-4 pt-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">First Name</label>
                  <input
                    value={editForm.first_name}
                    onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">Last Name</label>
                  <input
                    value={editForm.last_name}
                    onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Email Address</label>
                <input
                  value={selectedUser.email || ""}
                  disabled
                  className="w-full px-3 py-2 border rounded-md bg-slate-50 text-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">KYC Status</label>
                  <input
                    value={selectedUser.kyc_status || "N/A"}
                    disabled
                    className="w-full px-3 py-2 border rounded-md bg-slate-50 text-slate-500 capitalize"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">Account Status</label>
                  <input
                    value={selectedUser.is_suspended ? "Suspended" : "Active"}
                    disabled
                    className={`w-full px-3 py-2 border rounded-md bg-slate-50 ${selectedUser.is_suspended ? "text-rose-500 font-bold" : "text-emerald-500 font-bold"}`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Role</label>
                <Select value={editForm.role} onValueChange={(val) => setEditForm({ ...editForm, role: val })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buyer">Buyer</SelectItem>
                    <SelectItem value="seller">Seller</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700" disabled={processingId === "save-edit"}>
                  {processingId === "save-edit" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="p-4 text-center text-rose-500">Failed to load user details.</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
