"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { useUserStore } from "../store/useUserStore";
import { isAdmin } from "@/lib/rbac";
import { useAdminAgentsStore } from "../store/useAdminAgentsStore";
import { useAdminUsersStore } from "../store/useAdminUsersStore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import {
  Loader2, Eye, Mail, Phone, User, CalendarDays, ShieldCheck, ShieldOff,
  Plus, UserMinus, UserPlus, Users, BadgeCheck,
} from "lucide-react";

import { AgentAssignmentSummary } from "../schemas/agentSchema";
import { getErrorMessage } from "../lib/errors";

type CreateMode = "promote" | "create";

export default function AgentsTab() {
  const { getToken } = useAuth();
  const backendUser = useUserStore((s) => s.backendUser);
  const canManageAgents = isAdmin(backendUser?.role);
  const {
    agents, loading, selectedAgent, assignments, detailsLoading, error,
    fetchAdminAgents, fetchAgentDetail, createAdminAgent, demoteAgent,
    assignSeller, revokeSellerAssignment, clearSelectedAgent,
  } = useAdminAgentsStore();
  const { users: pickerUsers, fetchAdminUsers } = useAdminUsersStore();

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [createMode, setCreateMode] = useState<CreateMode>("create");
  const [createForm, setCreateForm] = useState({
    user_id: "",
    email: "",
    phone: "",
    first_name: "",
    last_name: "",
  });
  const [assignSellerId, setAssignSellerId] = useState("");
  const [assignAgentId, setAssignAgentId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminAgents(getToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getToken]);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  const handleOpenView = async (id: string) => {
    setViewModalOpen(true);
    await fetchAgentDetail(getToken, id);
  };

  const handleOpenCreate = async () => {
    setFormError(null);
    setCreateMode("create");
    setCreateForm({ user_id: "", email: "", phone: "", first_name: "", last_name: "" });
    setCreateModalOpen(true);
    await fetchAdminUsers(getToken);
  };

  const nonAgentUsers = (pickerUsers || [])
    .filter((u) => {
      const role = (u.role || "").toLowerCase();
      return role !== "agent" && role !== "admin";
    })
    .map((u) => ({
      id: u.id,
      label: `${u.first_name} ${u.last_name}`.trim() || u.email || u.phone || u.id,
    }));

  const sellerOptions = (pickerUsers || []).filter((u) => (u.role || "").toLowerCase() === "seller");

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setProcessingId("create-agent");
    try {
      if (createMode === "promote") {
        if (!createForm.user_id) {
          setFormError("Select a user to promote.");
          return;
        }
        await createAdminAgent(getToken, { user_id: createForm.user_id });
      } else {
        if (!createForm.email.trim()) {
          setFormError("Email is required for new agents.");
          return;
        }
        await createAdminAgent(getToken, {
          email: createForm.email.trim(),
          phone: createForm.phone.trim() || undefined,
          first_name: createForm.first_name.trim() || undefined,
          last_name: createForm.last_name.trim() || undefined,
        });
      }
      setCreateModalOpen(false);
    } catch (err: unknown) {
      setFormError(getErrorMessage(err, "Failed to create agent"));
    } finally {
      setProcessingId(null);
    }
  };

  const handleDemote = async (id: string) => {
    if (!confirm("Demote this agent to buyer? All active seller assignments will be revoked.")) return;
    setProcessingId(id);
    try {
      await demoteAgent(getToken, id);
      if (viewModalOpen) {
        setViewModalOpen(false);
        clearSelectedAgent();
      }
    } catch (err: unknown) {
      alert(getErrorMessage(err, "Failed to demote agent"));
    } finally {
      setProcessingId(null);
    }
  };

  const handleOpenAssign = async (agentId: string) => {
    setAssignAgentId(agentId);
    setAssignSellerId("");
    setFormError(null);
    setAssignModalOpen(true);
    await fetchAdminUsers(getToken, "seller");
  };

  const handleAssignSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignAgentId || !assignSellerId) {
      setFormError("Select a seller.");
      return;
    }
    setProcessingId("assign-seller");
    setFormError(null);
    try {
      await assignSeller(getToken, { agent_id: assignAgentId, seller_id: assignSellerId });
      setAssignModalOpen(false);
      if (viewModalOpen && selectedAgent?.id === assignAgentId) {
        await fetchAgentDetail(getToken, assignAgentId);
      }
    } catch (err: unknown) {
      setFormError(getErrorMessage(err, "Failed to assign seller"));
    } finally {
      setProcessingId(null);
    }
  };

  const handleRevokeAssignment = async (assignmentId: number, agentId: string) => {
    if (!confirm("Revoke this seller assignment?")) return;
    setProcessingId(`assign-${assignmentId}`);
    try {
      await revokeSellerAssignment(getToken, assignmentId, agentId);
    } catch (err: unknown) {
      alert(getErrorMessage(err, "Failed to revoke assignment"));
    } finally {
      setProcessingId(null);
    }
  };

  if (loading && agents.length === 0) {
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
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Agents</h2>
          <p className="text-sm text-slate-500 mt-0.5">Manage field agents and seller assignments</p>
        </div>
        {canManageAgents && (
          <Button
            onClick={handleOpenCreate}
            className="h-9 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-bold text-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Create Agent
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="text-xs">
            <TableHeader className="bg-slate-50">
              <TableRow className="border-b border-slate-100 hover:bg-transparent">
                <TableHead className="p-4 pl-6 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Agent</TableHead>
                <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Status</TableHead>
                <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Managed Sellers</TableHead>
                <TableHead className="p-4 pr-6 text-right font-bold text-slate-400 uppercase tracking-wider text-[10px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {agents.map((agent) => {
                const name = `${agent.first_name} ${agent.last_name}`.trim() || "Unknown";
                const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                const colorMap = ["bg-blue-600", "bg-indigo-600", "bg-amber-600", "bg-rose-600", "bg-emerald-600"];
                const avatarColor = colorMap[agent.id.charCodeAt(agent.id.length - 1) % colorMap.length] || "bg-slate-600";

                return (
                  <TableRow key={agent.id} className="hover:bg-slate-50/50 transition border-b border-slate-100">
                    <TableCell className="p-4 pl-6 font-bold text-slate-800 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${avatarColor} text-white flex items-center justify-center font-bold text-xs shrink-0`}>
                        {initials}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-slate-800">{name}</span>
                        <span className="text-[11px] text-slate-400 font-semibold mt-0.5">
                          {agent.email || agent.phone || "—"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="p-4">
                      {agent.is_suspended ? (
                        <span className="inline-flex px-2 py-0.5 rounded-full border text-[10px] font-bold bg-rose-500/10 border-rose-500/20 text-rose-600">
                          Suspended
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 rounded-full border text-[10px] font-bold bg-emerald-500/10 border-emerald-500/20 text-emerald-600">
                          Active
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="p-4 text-slate-600 font-bold">
                      {agent.active_managed_sellers ?? 0}
                    </TableCell>
                    <TableCell className="p-4 pr-6 text-right whitespace-nowrap">
                      {processingId === agent.id ? (
                        <div className="flex justify-end">
                          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2 items-center">
                          <Button
                            onClick={() => handleOpenView(agent.id)}
                            variant="ghost"
                            className="h-8 px-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {canManageAgents && (
                          <Button
                            onClick={() => handleOpenAssign(agent.id)}
                            variant="outline"
                            className="h-8 px-3 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 font-bold text-xs cursor-pointer"
                          >
                            <UserPlus className="w-3.5 h-3.5 mr-1" />
                            Assign
                          </Button>
                          )}
                          {canManageAgents && (
                          <Button
                            onClick={() => handleDemote(agent.id)}
                            variant="outline"
                            className="h-8 px-3 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 font-bold text-xs cursor-pointer"
                          >
                            <UserMinus className="w-3.5 h-3.5 mr-1" />
                            Demote
                          </Button>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {agents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="p-8 text-center text-slate-400">
                    No agents found. Create or promote a user to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* VIEW DETAILS MODAL */}
      <Dialog open={viewModalOpen} onOpenChange={(open) => {
        setViewModalOpen(open);
        if (!open) clearSelectedAgent();
      }}>
        <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-[640px] max-h-[85vh] overflow-y-auto p-0 rounded-2xl" onInteractOutside={(e) => e.preventDefault()}>
          {detailsLoading ? (
            <div className="flex justify-center items-center p-16">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : selectedAgent ? (
            <>
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-6 pt-6 pb-8">
                <div className="flex items-center gap-4">
                  {(() => {
                    const name = `${selectedAgent.first_name} ${selectedAgent.last_name}`.trim() || "A";
                    const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                    return (
                      <div className="w-16 h-16 rounded-2xl bg-blue-500 text-white flex items-center justify-center font-bold text-xl shadow-lg shrink-0">
                        {initials}
                      </div>
                    );
                  })()}
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {`${selectedAgent.first_name} ${selectedAgent.last_name}`.trim() || "Unknown"}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 text-xs font-semibold capitalize">
                        {selectedAgent.role}
                      </span>
                      {selectedAgent.is_suspended ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold">
                          <ShieldOff className="w-3 h-3" /> Suspended
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
                          <ShieldCheck className="w-3 h-3" /> Active
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
                <Section title="Contact">
                  <InfoRow icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={selectedAgent.email || "—"} />
                  <InfoRow icon={<Phone className="w-3.5 h-3.5" />} label="Phone" value={selectedAgent.phone || "—"} />
                  <InfoRow icon={<User className="w-3.5 h-3.5" />} label="User ID" value={selectedAgent.id} mono />
                </Section>

                <Section title="Agent Metrics">
                  <InfoRow
                    icon={<Users className="w-3.5 h-3.5" />}
                    label="Managed Sellers"
                    value={String(selectedAgent.active_managed_sellers ?? 0)}
                  />
                  <InfoRow
                    icon={<BadgeCheck className="w-3.5 h-3.5" />}
                    label="KYC"
                    value={selectedAgent.kyc_status || "—"}
                    badge
                    badgeColor={selectedAgent.kyc_status === "verified" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}
                  />
                </Section>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Assignments</p>
                    {canManageAgents && (
                    <Button
                      onClick={() => handleOpenAssign(selectedAgent.id)}
                      variant="outline"
                      className="h-7 px-2.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 font-bold text-[10px] cursor-pointer"
                    >
                      <UserPlus className="w-3 h-3 mr-1" />
                      Assign Seller
                    </Button>
                    )}
                  </div>
                  <div className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                    {(assignments.length ? assignments : selectedAgent.assignments || []).length === 0 ? (
                      <p className="px-3 py-4 text-xs text-slate-400 text-center">No assignments yet.</p>
                    ) : (
                      <Table className="text-xs">
                        <TableHeader>
                          <TableRow className="hover:bg-transparent border-b border-slate-100">
                            <TableHead className="px-3 py-2 text-[10px] text-slate-400">Seller</TableHead>
                            <TableHead className="px-3 py-2 text-[10px] text-slate-400">Status</TableHead>
                            <TableHead className="px-3 py-2 text-[10px] text-slate-400">Assigned</TableHead>
                            <TableHead className="px-3 py-2 text-[10px] text-slate-400 text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(assignments.length ? assignments : selectedAgent.assignments || []).map((a: AgentAssignmentSummary) => (
                            <TableRow key={a.id} className="border-b border-slate-100">
                              <TableCell className="px-3 py-2.5">
                                <div className="font-semibold text-slate-700">{a.seller_name || "—"}</div>
                                <div className="font-mono text-[10px] text-slate-400">{a.seller_id}</div>
                              </TableCell>
                              <TableCell className="px-3 py-2.5">
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                                  a.status === "active"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-slate-100 text-slate-500"
                                }`}>
                                  {a.status}
                                </span>
                              </TableCell>
                              <TableCell className="px-3 py-2.5 text-slate-500">{formatDate(a.created_at)}</TableCell>
                              <TableCell className="px-3 py-2.5 text-right">
                                {canManageAgents && a.status === "active" && (
                                  processingId === `assign-${a.id}` ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500 ml-auto" />
                                  ) : (
                                    <Button
                                      onClick={() => handleRevokeAssignment(a.id, selectedAgent.id)}
                                      variant="ghost"
                                      className="h-7 px-2 text-[10px] font-bold text-rose-500 hover:bg-rose-50 cursor-pointer"
                                    >
                                      Revoke
                                    </Button>
                                  )
                                )}
                                {a.status !== "active" && a.revoked_at && (
                                  <span className="text-[10px] text-slate-400">{formatDate(a.revoked_at)}</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </div>

                <Section title="Timestamps">
                  <InfoRow icon={<CalendarDays className="w-3.5 h-3.5" />} label="Joined" value={formatDate(selectedAgent.created_at)} />
                  <InfoRow icon={<CalendarDays className="w-3.5 h-3.5" />} label="Last Updated" value={formatDate(selectedAgent.updated_at)} />
                </Section>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                {canManageAgents ? (
                <Button
                  variant="outline"
                  onClick={() => handleDemote(selectedAgent.id)}
                  className="h-8 px-4 text-xs font-bold border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                  disabled={processingId === selectedAgent.id}
                >
                  <UserMinus className="w-3.5 h-3.5 mr-1.5" />
                  Demote Agent
                </Button>
                ) : <div />}
                <Button
                  variant="ghost"
                  onClick={() => { setViewModalOpen(false); clearSelectedAgent(); }}
                  className="h-8 px-4 text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  Close
                </Button>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-rose-500 text-sm">Failed to load agent details.</div>
          )}
        </DialogContent>
      </Dialog>

      {/* CREATE / PROMOTE MODAL */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-[440px] max-h-[85vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Create / Promote Agent</DialogTitle>
          </DialogHeader>
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant={createMode === "create" ? "default" : "outline"}
              onClick={() => setCreateMode("create")}
              className={`h-8 px-3 text-xs font-bold cursor-pointer ${createMode === "create" ? "bg-blue-600 text-white" : ""}`}
            >
              New agent
            </Button>
            <Button
              type="button"
              variant={createMode === "promote" ? "default" : "outline"}
              onClick={() => setCreateMode("promote")}
              className={`h-8 px-3 text-xs font-bold cursor-pointer ${createMode === "promote" ? "bg-blue-600 text-white" : ""}`}
            >
              Promote user
            </Button>
          </div>
          <form onSubmit={handleCreateAgent} className="space-y-4 pt-2 text-sm">
            {createMode === "promote" ? (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Existing user</label>
                <Select value={createForm.user_id} onValueChange={(val) => setCreateForm({ ...createForm, user_id: val })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select user to promote" />
                  </SelectTrigger>
                  <SelectContent>
                    {nonAgentUsers.map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-slate-400">Prefer Agents screen promote over changing role in Users.</p>
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">Email *</label>
                  <input
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md outline-none focus:border-blue-500"
                    required
                    placeholder="agent@example.com"
                  />
                  <p className="text-[11px] text-slate-400">Required for agent email-OTP login.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500">First name</label>
                    <input
                      value={createForm.first_name}
                      onChange={(e) => setCreateForm({ ...createForm, first_name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500">Last name</label>
                    <input
                      value={createForm.last_name}
                      onChange={(e) => setCreateForm({ ...createForm, last_name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">Phone</label>
                  <input
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md outline-none focus:border-blue-500"
                    placeholder="9876543210"
                  />
                </div>
              </>
            )}
            {formError && <p className="text-xs text-rose-500">{formError}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>Cancel</Button>
              <Button
                type="submit"
                className="bg-blue-600 text-white hover:bg-blue-700"
                disabled={processingId === "create-agent"}
              >
                {processingId === "create-agent" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ASSIGN SELLER MODAL */}
      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-[420px] max-h-[85vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Assign Seller to Agent</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAssignSeller} className="space-y-4 pt-2 text-sm">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">Seller</label>
              <Select value={assignSellerId} onValueChange={setAssignSellerId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select seller" />
                </SelectTrigger>
                <SelectContent>
                  {sellerOptions.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {`${u.first_name} ${u.last_name}`.trim() || u.email || u.phone || u.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-slate-400">
                Assigning revokes any other active assignment for this seller.
              </p>
            </div>
            {formError && <p className="text-xs text-rose-500">{formError}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setAssignModalOpen(false)}>Cancel</Button>
              <Button
                type="submit"
                className="bg-blue-600 text-white hover:bg-blue-700"
                disabled={processingId === "assign-seller"}
              >
                {processingId === "assign-seller" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Assign"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{title}</p>
      <div className="bg-slate-50 rounded-xl border border-slate-100 divide-y divide-slate-100 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function InfoRow({
  icon, label, value, mono = false, badge = false, badgeColor = "bg-slate-100 text-slate-600",
}: {
  icon: React.ReactNode; label: string; value: string; mono?: boolean; badge?: boolean; badgeColor?: string;
}) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5 gap-3">
      <div className="flex items-center gap-2 text-slate-400 shrink-0">
        {icon}
        <span className="text-[11px] font-semibold text-slate-500">{label}</span>
      </div>
      {badge ? (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${badgeColor}`}>{value}</span>
      ) : (
        <span className={`text-xs font-semibold text-slate-700 text-right break-all ${mono ? "font-mono text-[10px] text-slate-500" : ""}`}>
          {value}
        </span>
      )}
    </div>
  );
}
