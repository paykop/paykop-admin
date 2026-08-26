"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { useUserStore } from "../store/useUserStore";
import { isAdmin } from "@/lib/rbac";
import { useAdminSupportStore } from "../store/useAdminSupportStore";
import { useAdminUsersStore } from "../store/useAdminUsersStore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Loader2, Eye, Plus, UserMinus, Headset } from "lucide-react";
import { getErrorMessage } from "../lib/errors";

type CreateMode = "promote" | "create";

export default function SupportTab() {
  const { getToken } = useAuth();
  const backendUser = useUserStore((s) => s.backendUser);
  const canManage = isAdmin(backendUser?.role);

  const {
    support, loading, selected, detailsLoading, error,
    fetchSupport, fetchDetail, createSupport, revokeSupport, clearSelected,
  } = useAdminSupportStore();
  const { users: pickerUsers, fetchAdminUsers } = useAdminUsersStore();

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createMode, setCreateMode] = useState<CreateMode>("create");
  const [form, setForm] = useState({
    user_id: "",
    email: "",
    phone: "",
    first_name: "",
    last_name: "",
  });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (canManage) fetchSupport(getToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getToken, canManage]);

  if (!canManage) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
        <Headset className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-800 font-bold text-sm">Admin access required</p>
        <p className="text-xs text-slate-400 mt-1">Only administrators can manage support staff.</p>
      </div>
    );
  }

  const nonSupportUsers = (pickerUsers || []).filter((u) => {
    const role = (u.role || "").toLowerCase();
    return role !== "support" && role !== "admin";
  });

  const handleOpenCreate = async () => {
    setFormError(null);
    setCreateMode("create");
    setForm({ user_id: "", email: "", phone: "", first_name: "", last_name: "" });
    setCreateOpen(true);
    await fetchAdminUsers(getToken);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setProcessingId("create");
    try {
      if (createMode === "promote") {
        if (!form.user_id) {
          setFormError("Select a user to promote.");
          return;
        }
        await createSupport(getToken, { user_id: form.user_id });
      } else {
        if (!form.email.trim()) {
          setFormError("Email is required.");
          return;
        }
        await createSupport(getToken, {
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          first_name: form.first_name.trim() || undefined,
          last_name: form.last_name.trim() || undefined,
        });
      }
      setCreateOpen(false);
    } catch (err: unknown) {
      setFormError(getErrorMessage(err, "Failed to create support staff"));
    } finally {
      setProcessingId(null);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Revoke support role and demote to buyer?")) return;
    setProcessingId(id);
    try {
      await revokeSupport(getToken, id);
      setViewOpen(false);
      clearSelected();
    } catch (err: unknown) {
      alert(getErrorMessage(err, "Failed to revoke support role"));
    } finally {
      setProcessingId(null);
    }
  };

  if (loading && support.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Support Staff</h2>
          <p className="text-sm text-slate-500 mt-0.5">Provision and revoke support team accounts</p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="h-9 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-bold text-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Support
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="text-xs">
            <TableHeader className="bg-slate-50">
              <TableRow className="border-b border-slate-100 hover:bg-transparent">
                <TableHead className="p-4 pl-6 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Member</TableHead>
                <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Status</TableHead>
                <TableHead className="p-4 pr-6 text-right text-slate-400 font-bold uppercase tracking-wider text-[10px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {support.map((member) => {
                const name = `${member.first_name} ${member.last_name}`.trim() || "Unknown";
                return (
                  <TableRow key={member.id} className="hover:bg-slate-50/50 border-b border-slate-100">
                    <TableCell className="p-4 pl-6">
                      <div className="font-bold text-slate-800 text-[13px]">{name}</div>
                      <div className="text-[11px] text-slate-400">{member.email || member.phone || member.id}</div>
                    </TableCell>
                    <TableCell className="p-4">
                      {member.is_suspended ? (
                        <span className="inline-flex px-2 py-0.5 rounded-full border text-[10px] font-bold bg-rose-500/10 border-rose-500/20 text-rose-600">
                          Suspended
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 rounded-full border text-[10px] font-bold bg-emerald-500/10 border-emerald-500/20 text-emerald-600">
                          Active
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="p-4 pr-6 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={async () => {
                            setViewOpen(true);
                            await fetchDetail(getToken, member.id);
                          }}
                          variant="ghost"
                          className="h-8 px-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleRevoke(member.id)}
                          variant="outline"
                          disabled={processingId === member.id}
                          className="h-8 px-3 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 font-bold text-xs cursor-pointer"
                        >
                          {processingId === member.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>
                              <UserMinus className="w-3.5 h-3.5 mr-1" />
                              Revoke
                            </>
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {support.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="p-8 text-center text-slate-400">
                    No support staff yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={viewOpen} onOpenChange={(open) => { setViewOpen(open); if (!open) clearSelected(); }}>
        <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-md max-h-[85vh] overflow-y-auto bg-white border border-slate-200 rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Support Member</DialogTitle>
          </DialogHeader>
          {detailsLoading || !selected ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="space-y-3 text-sm pt-2">
              <p><span className="text-slate-400 text-xs font-bold uppercase">Name</span><br />{selected.first_name} {selected.last_name}</p>
              <p><span className="text-slate-400 text-xs font-bold uppercase">Email</span><br />{selected.email || "—"}</p>
              <p><span className="text-slate-400 text-xs font-bold uppercase">Phone</span><br />{selected.phone || "—"}</p>
              <p><span className="text-slate-400 text-xs font-bold uppercase">Role</span><br />{selected.role}</p>
              <Button
                onClick={() => handleRevoke(selected.id)}
                variant="outline"
                className="w-full mt-2 border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs cursor-pointer"
              >
                Revoke Support Role
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-md max-h-[85vh] overflow-y-auto bg-white border border-slate-200 rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Add Support Staff</DialogTitle>
          </DialogHeader>
          <div className="flex gap-2 mb-4">
            <Button
              type="button"
              variant={createMode === "create" ? "default" : "outline"}
              onClick={() => setCreateMode("create")}
              className={`h-8 px-3 text-xs font-bold cursor-pointer ${createMode === "create" ? "bg-blue-600 text-white" : ""}`}
            >
              Create New
            </Button>
            <Button
              type="button"
              variant={createMode === "promote" ? "default" : "outline"}
              onClick={() => setCreateMode("promote")}
              className={`h-8 px-3 text-xs font-bold cursor-pointer ${createMode === "promote" ? "bg-blue-600 text-white" : ""}`}
            >
              Promote Existing
            </Button>
          </div>
          <form onSubmit={handleCreate} className="space-y-3 text-xs">
            {createMode === "promote" ? (
              <Select value={form.user_id} onValueChange={(val) => setForm({ ...form, user_id: val })}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select user" /></SelectTrigger>
                <SelectContent>
                  {nonSupportUsers.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {`${u.first_name} ${u.last_name}`.trim() || u.email || u.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <>
                <input
                  required
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    placeholder="First name"
                    value={form.first_name}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <input
                    placeholder="Last name"
                    value={form.last_name}
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <input
                  placeholder="Phone (optional)"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </>
            )}
            {formError && <p className="text-rose-500 text-[11px]">{formError}</p>}
            <Button
              type="submit"
              disabled={processingId === "create"}
              className="w-full bg-blue-600 text-white font-bold h-9 rounded-lg cursor-pointer"
            >
              {processingId === "create" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
