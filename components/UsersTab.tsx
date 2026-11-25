// src/components/UsersTab.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { useUserStore } from "../store/useUserStore";
import { isAdmin } from "@/lib/rbac";
import RoleAccessBanner from "./RoleAccessBanner";
import { useAdminUsersStore } from "../store/useAdminUsersStore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import {
  Loader2, Edit, Eye, Mail, Phone, MapPin, ShieldCheck, ShieldOff,
  User, CalendarDays, BadgeCheck, CreditCard, LinkIcon, FileText,
  LogIn, Star, Trophy, Award, Handshake, UserCog, X,
} from "lucide-react";
import Link from "next/link";
import SafeImage from "./SafeImage";
import { UpdateUserRequest, UserDetailsResponse } from "../schemas/userSchema";

type EditFormState = { first_name: string; last_name: string; role: string };

export default function UsersTab() {
  const { getToken } = useAuth();
  const backendUser = useUserStore((s) => s.backendUser);
  const canChangeRoles = isAdmin(backendUser?.role);
  const canManageUsers = isAdmin(backendUser?.role);
  const {
    users, loading, fetchAdminUsers, suspendAdminUser, verifyAdminUser,
    selectedUser, detailsLoading, fetchUserDetail, updateUserDetails, updateUserRoleAction, clearSelectedUser,
  } = useAdminUsersStore();

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    fetchAdminUsers(getToken, roleFilter === "all" ? undefined : roleFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getToken, roleFilter]);

  const handleToggleStatus = async (id: string, action: "suspend" | "unsuspend" | "verify") => {
    setProcessingId(id);
    if (action === "suspend") await suspendAdminUser(getToken, id, true);
    else if (action === "unsuspend") await suspendAdminUser(getToken, id, false);
    else await verifyAdminUser(getToken, id);
    setProcessingId(null);
  };

  const handleOpenView = async (id: string) => {
    setViewModalOpen(true);
    await fetchUserDetail(getToken, id);
  };

  const handleOpenEdit = async (id: string) => {
    setEditModalOpen(true);
    await fetchUserDetail(getToken, id);
  };

  const handleSaveEdit = async (editForm: EditFormState) => {
    if (!selectedUser) return;
    setProcessingId("save-edit");
    try {
      const payload: UpdateUserRequest = { first_name: editForm.first_name, last_name: editForm.last_name };
      const newRole = editForm.role?.trim().toLowerCase();
      const oldRole = selectedUser.role?.trim().toLowerCase();
      const nameChanged =
        editForm.first_name !== selectedUser.first_name ||
        editForm.last_name !== selectedUser.last_name;
      const roleChanged = Boolean(newRole && newRole !== oldRole);

      if (roleChanged) {
        if (!canChangeRoles) {
          alert("Only admins can change user roles.");
          return;
        }
        if (newRole === "agent" || oldRole === "agent") {
          alert("Promote or demote agents from the Agents page so assignments stay consistent.");
          return;
        }
        if (newRole === "admin") {
          alert("Cannot promote users to admin via this screen.");
          return;
        }
        await updateUserRoleAction(getToken, selectedUser.id, newRole!);
      }

      if (nameChanged) {
        await updateUserDetails(getToken, selectedUser.id, payload);
      } else if (roleChanged) {
        await fetchUserDetail(getToken, selectedUser.id);
        await fetchAdminUsers(getToken, roleFilter === "all" ? undefined : roleFilter);
      }

      setEditModalOpen(false);
      clearSelectedUser();
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusStyle = (isOnboarded: boolean) =>
    isOnboarded ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" : "bg-amber-500/10 border-amber-500/20 text-amber-600";

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const getBadgeColor = (badge?: string | null) => {
    if (!badge) return "bg-slate-100 text-slate-500";
    if (badge.toLowerCase().includes("gold")) return "bg-yellow-100 text-yellow-700";
    if (badge.toLowerCase().includes("silver")) return "bg-slate-200 text-slate-700";
    return "bg-amber-100 text-amber-700"; // Bronze
  };

  if (loading && users.length === 0) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <RoleAccessBanner />

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Users</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {canManageUsers
              ? "Manage status, verification, and roles"
              : "Search and view user profiles (read-only)"}
          </p>
        </div>
        {/* Role Filter (July 2026) */}
        <Select value={roleFilter} onValueChange={(val) => setRoleFilter(val)}>
          <SelectTrigger className="w-[150px] bg-white border border-slate-200 text-slate-700 font-semibold text-xs rounded-lg shadow-sm">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="support">Support</SelectItem>
            <SelectItem value="buyer">Buyer</SelectItem>
            <SelectItem value="seller">Seller</SelectItem>
            <SelectItem value="agent">Agent</SelectItem>
          </SelectContent>
        </Select>
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
                <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Gamification</TableHead>
                <TableHead className="p-4 pr-6 text-right font-bold text-slate-400 uppercase tracking-wider text-[10px]">Actions</TableHead>
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
                      <div className={`w-8 h-8 rounded-full ${avatarColor} text-white flex items-center justify-center font-bold text-xs shrink-0`}>{initials}</div>
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
                          <span className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-bold ${user.kyc_status === "verified" ? "bg-blue-500/10 border-blue-500/20 text-blue-600" : "bg-slate-500/10 border-slate-500/20 text-slate-600"} capitalize`}>
                            KYC: {user.kyc_status}
                          </span>
                        )}
                        {user.is_suspended && (
                          <span className="inline-flex px-2 py-0.5 rounded-full border text-[10px] font-bold bg-rose-500/10 border-rose-500/20 text-rose-600">Suspended</span>
                        )}
                      </div>
                    </TableCell>
                    {/* Gamification column (July 2026) */}
                    <TableCell className="p-4">
                      <div className="flex flex-col gap-1">
                        {user.badge && (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${getBadgeColor(user.badge)}`}>
                            <Trophy className="w-2.5 h-2.5" />{user.badge}
                          </span>
                        )}
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold">
                          <span className="flex items-center gap-0.5"><Star className="w-2.5 h-2.5 text-amber-400" />{user.community_score ?? 0}</span>
                          <span className="flex items-center gap-0.5"><Award className="w-2.5 h-2.5 text-purple-400" />{user.reward_points ?? 0} pts</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="p-4 pr-6 text-right whitespace-nowrap">
                      {processingId === user.id ? (
                        <div className="flex justify-end"><Loader2 className="w-4 h-4 animate-spin text-blue-500" /></div>
                      ) : (
                        <div className="flex justify-end gap-2 items-center">
                          <Button onClick={() => handleOpenView(user.id)} variant="ghost" className="h-8 px-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer" title="View Details">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {canManageUsers && (
                            <>
                              <Button onClick={() => handleOpenEdit(user.id)} variant="ghost" className="h-8 px-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer" title="Edit User">
                                <Edit className="w-4 h-4" />
                              </Button>
                              {user.kyc_status !== "verified" && (
                                <Button onClick={() => handleToggleStatus(user.id, "verify")} variant="outline" className="h-8 px-3 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 font-bold text-xs cursor-pointer">Verify</Button>
                              )}
                              {!user.is_suspended ? (
                                <Button onClick={() => handleToggleStatus(user.id, "suspend")} variant="outline" className="h-8 px-3 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 font-bold text-xs cursor-pointer">Suspend</Button>
                              ) : (
                                <Button onClick={() => handleToggleStatus(user.id, "unsuspend")} variant="outline" className="h-8 px-3 rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-50 font-bold text-xs cursor-pointer">Unsuspend</Button>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="p-8 text-center text-slate-400">No users found{roleFilter !== "all" ? ` for role "${roleFilter}"` : ""}.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* VIEW DETAILS MODAL */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent
          className={`w-full max-w-[calc(100%-2rem)] sm:max-w-[560px] max-h-[85vh] overflow-hidden p-0 rounded-2xl ${
            selectedUser && !detailsLoading
              ? "[&_[data-slot=dialog-close]]:text-white/80 [&_[data-slot=dialog-close]]:hover:text-white [&_[data-slot=dialog-close]]:hover:bg-white/10"
              : ""
          }`}
          onInteractOutside={(e) => e.preventDefault()}
        >
          {detailsLoading ? (
            <div className="flex justify-center items-center p-16"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
          ) : selectedUser ? (
            <>
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-6 pt-6 pb-8">
                <div className="flex items-center gap-4">
                  {selectedUser.profile_picture_url ? (
                    <SafeImage src={selectedUser.profile_picture_url} alt="Avatar" width={64} height={64} className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shadow-lg" />
                  ) : (() => {
                    const name = `${selectedUser.first_name} ${selectedUser.last_name}`.trim() || "U";
                    const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                    const colorMap = ["bg-blue-500", "bg-indigo-500", "bg-amber-500", "bg-rose-500", "bg-emerald-500"];
                    const avatarColor = colorMap[selectedUser.id.charCodeAt(selectedUser.id.length - 1) % colorMap.length];
                    return <div className={`w-16 h-16 rounded-2xl ${avatarColor} text-white flex items-center justify-center font-bold text-xl shadow-lg shrink-0`}>{initials}</div>;
                  })()}
                  <div>
                    <h3 className="text-xl font-bold text-white">{`${selectedUser.first_name} ${selectedUser.last_name}`.trim() || "Unknown"}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 text-xs font-semibold capitalize">{selectedUser.role}</span>
                      {selectedUser.is_suspended
                        ? <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold"><ShieldOff className="w-3 h-3" /> Suspended</span>
                        : <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold"><ShieldCheck className="w-3 h-3" /> Active</span>}
                      {selectedUser.badge && (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${getBadgeColor(selectedUser.badge)}`}>
                          <Trophy className="w-3 h-3" />{selectedUser.badge}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
                <Section title="Contact Information">
                  <InfoRow icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={selectedUser.email || "—"} />
                  <InfoRow icon={<Phone className="w-3.5 h-3.5" />} label="Phone" value={selectedUser.phone || "—"} />
                  <InfoRow icon={<MapPin className="w-3.5 h-3.5" />} label="Address" value={selectedUser.address || "—"} />
                </Section>
                <Section title="Account Information">
                  <InfoRow icon={<User className="w-3.5 h-3.5" />} label="User ID" value={selectedUser.id} mono />
                  <InfoRow icon={<LogIn className="w-3.5 h-3.5" />} label="Auth Provider" value={selectedUser.auth_provider || selectedUser.auth_source || "—"} />
                  <InfoRow icon={<BadgeCheck className="w-3.5 h-3.5" />} label="KYC Status" value={selectedUser.kyc_status} badge badgeColor={selectedUser.kyc_status === "verified" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"} />
                  <InfoRow icon={<ShieldCheck className="w-3.5 h-3.5" />} label="Onboarding" value={selectedUser.is_onboarded ? "Completed" : "Pending"} badge badgeColor={selectedUser.is_onboarded ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"} />
                  <InfoRow icon={<CreditCard className="w-3.5 h-3.5" />} label="Subscription" value={selectedUser.has_subscription ? "Active" : "None"} badge badgeColor={selectedUser.has_subscription ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-500"} />
                  {selectedUser.role === "seller" && (
                    <>
                      <InfoRow
                        icon={<CreditCard className="w-3.5 h-3.5" />}
                        label="Commercial Access"
                        value={selectedUser.commercial_access_status || "none"}
                        badge
                        badgeColor={
                          selectedUser.commercial_access_status && selectedUser.commercial_access_status !== "none"
                            ? "bg-indigo-100 text-indigo-700"
                            : "bg-slate-100 text-slate-500"
                        }
                      />
                      {selectedUser.commercial_expires_at && (
                        <InfoRow icon={<CalendarDays className="w-3.5 h-3.5" />} label="Access Expires" value={formatDate(selectedUser.commercial_expires_at)} />
                      )}
                      {typeof selectedUser.is_seller_ready === "boolean" && (
                        <InfoRow
                          icon={<ShieldCheck className="w-3.5 h-3.5" />}
                          label="Seller Ready"
                          value={
                            selectedUser.is_seller_ready
                              ? "Yes"
                              : (selectedUser.seller_ready_missing?.length
                                ? `Missing: ${selectedUser.seller_ready_missing.join(", ")}`
                                : "No")
                          }
                          badge
                          badgeColor={selectedUser.is_seller_ready ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}
                        />
                      )}
                      <div className="px-4 py-3 text-[11px] text-slate-500 leading-relaxed border-t border-slate-100">
                        <strong className="text-slate-600">Verify</strong> on the list only sets user KYC status (break-glass).
                        Use the{" "}
                        <Link href="/kyc" className="text-blue-600 font-semibold underline underline-offset-2">
                          KYC tab
                        </Link>{" "}
                        to approve pending submissions. Storefront location still requires commercial access even when KYC is verified.
                      </div>
                    </>
                  )}
                </Section>
                {(selectedUser.onboarding_source ||
                  selectedUser.created_by_agent_id ||
                  selectedUser.onboarded_by_agent_id ||
                  selectedUser.onboarded_at ||
                  selectedUser.active_assignment) && (
                  <Section title="Agent Provenance">
                    {selectedUser.onboarding_source && (
                      <InfoRow
                        icon={<Handshake className="w-3.5 h-3.5" />}
                        label="Onboarding Source"
                        value={selectedUser.onboarding_source.replace(/_/g, " ")}
                        badge
                        badgeColor="bg-indigo-100 text-indigo-700"
                      />
                    )}
                    {selectedUser.created_by_agent_id && (
                      <InfoRow icon={<UserCog className="w-3.5 h-3.5" />} label="Created by Agent" value={selectedUser.created_by_agent_id} mono />
                    )}
                    {selectedUser.onboarded_by_agent_id && (
                      <InfoRow icon={<UserCog className="w-3.5 h-3.5" />} label="Onboarded by Agent" value={selectedUser.onboarded_by_agent_id} mono />
                    )}
                    {selectedUser.onboarded_at && (
                      <InfoRow icon={<CalendarDays className="w-3.5 h-3.5" />} label="Onboarded At" value={formatDate(selectedUser.onboarded_at)} />
                    )}
                    {selectedUser.active_assignment && (
                      <>
                        <InfoRow
                          icon={<Handshake className="w-3.5 h-3.5" />}
                          label="Assignment Status"
                          value={selectedUser.active_assignment.status}
                          badge
                          badgeColor={selectedUser.active_assignment.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}
                        />
                        <InfoRow icon={<UserCog className="w-3.5 h-3.5" />} label="Assigned Agent" value={selectedUser.active_assignment.agent_id} mono />
                        <InfoRow
                          icon={<BadgeCheck className="w-3.5 h-3.5" />}
                          label="Assignment ID"
                          value={String(selectedUser.active_assignment.assignment_id)}
                          mono
                        />
                      </>
                    )}
                  </Section>
                )}
                {selectedUser.role?.toLowerCase() === "agent" && (
                  <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2.5 text-xs text-blue-700">
                    Manage this agent&apos;s role and seller assignments on the{" "}
                    <Link href="/agents" className="font-bold underline underline-offset-2">Agents</Link> page.
                  </div>
                )}
                {/* Gamification Section (July 2026) */}
                <Section title="Gamification">
                  <InfoRow icon={<Star className="w-3.5 h-3.5" />} label="Community Score" value={String(selectedUser.community_score ?? 0)} />
                  <InfoRow icon={<Award className="w-3.5 h-3.5" />} label="Reward Points" value={`${selectedUser.reward_points ?? 0} pts`} />
                  <InfoRow icon={<Trophy className="w-3.5 h-3.5" />} label="Badge" value={selectedUser.badge || "None"} badge badgeColor={getBadgeColor(selectedUser.badge)} />
                </Section>
                {selectedUser.bio && (
                  <Section title="Bio">
                    <div className="flex items-start gap-2 text-xs text-slate-600 px-3 py-2.5">
                      <FileText className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" />
                      <p className="leading-relaxed">{selectedUser.bio}</p>
                    </div>
                  </Section>
                )}
                {selectedUser.social_links && (
                  <Section title="Social Links">
                    <div className="flex items-center gap-2 text-xs text-blue-600 break-all px-3 py-2.5">
                      <LinkIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{selectedUser.social_links}</span>
                    </div>
                  </Section>
                )}
                <Section title="Timestamps">
                  <InfoRow icon={<CalendarDays className="w-3.5 h-3.5" />} label="Joined" value={formatDate(selectedUser.created_at)} />
                  <InfoRow icon={<CalendarDays className="w-3.5 h-3.5" />} label="Last Updated" value={formatDate(selectedUser.updated_at)} />
                </Section>
              </div>
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                {canManageUsers ? (
                  <Button variant="outline" onClick={() => { setViewModalOpen(false); clearSelectedUser(); handleOpenEdit(selectedUser.id); }} className="h-8 px-4 text-xs font-bold border-blue-200 text-blue-600 hover:bg-blue-50 cursor-pointer">
                    <Edit className="w-3.5 h-3.5 mr-1.5" />Edit User
                  </Button>
                ) : (
                  <span className="text-[11px] text-slate-400">View only — contact an admin for account changes.</span>
                )}
                <Button variant="ghost" onClick={() => { setViewModalOpen(false); clearSelectedUser(); }} className="h-8 px-4 text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer">Close</Button>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-rose-500 text-sm">Failed to load user details.</div>
          )}
        </DialogContent>
      </Dialog>

      {/* EDIT USER MODAL */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-[425px] max-h-[85vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader><DialogTitle>Edit User Profile</DialogTitle></DialogHeader>
          {detailsLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
          ) : selectedUser ? (
            <EditUserForm
              key={selectedUser.id}
              selectedUser={selectedUser}
              canChangeRoles={canChangeRoles}
              processingId={processingId}
              onSave={handleSaveEdit}
              onCancel={() => {
                setEditModalOpen(false);
                clearSelectedUser();
              }}
            />
          ) : (
            <div className="p-4 text-center text-rose-500">Failed to load user details.</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EditUserForm({
  selectedUser,
  canChangeRoles,
  processingId,
  onSave,
  onCancel,
}: {
  selectedUser: UserDetailsResponse;
  canChangeRoles: boolean;
  processingId: string | null;
  onSave: (form: EditFormState) => void;
  onCancel: () => void;
}) {
  const [editForm, setEditForm] = useState<EditFormState>({
    first_name: selectedUser.first_name || "",
    last_name: selectedUser.last_name || "",
    role: (selectedUser.role || "buyer").toLowerCase(),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(editForm);
      }}
      className="space-y-4 pt-4 text-sm"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500">First Name</label>
          <input value={editForm.first_name} onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })} className="w-full px-3 py-2 border rounded-md outline-none focus:border-blue-500" required />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500">Last Name</label>
          <input value={editForm.last_name} onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })} className="w-full px-3 py-2 border rounded-md outline-none focus:border-blue-500" required />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-500">Email Address</label>
        <input value={selectedUser.email || ""} disabled className="w-full px-3 py-2 border rounded-md bg-slate-50 text-slate-500" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500">KYC Status</label>
          <input value={selectedUser.kyc_status || "N/A"} disabled className="w-full px-3 py-2 border rounded-md bg-slate-50 text-slate-500 capitalize" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500">Account Status</label>
          <input value={selectedUser.is_suspended ? "Suspended" : "Active"} disabled className={`w-full px-3 py-2 border rounded-md bg-slate-50 ${selectedUser.is_suspended ? "text-rose-500 font-bold" : "text-emerald-500 font-bold"}`} />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-500">Role</label>
        <Select value={editForm.role} onValueChange={(val) => setEditForm({ ...editForm, role: val })} disabled={!canChangeRoles}>
          <SelectTrigger className="w-full"><SelectValue placeholder="Select role" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="buyer">Buyer</SelectItem>
            <SelectItem value="seller">Seller</SelectItem>
            <SelectItem value="support">Support</SelectItem>
            <SelectItem value="agent">Agent</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-[11px] text-slate-400">
          Promote/demote agents from the{" "}
          <Link href="/agents" className="text-blue-600 font-semibold underline underline-offset-2">Agents</Link>{" "}
          page (not here).
        </p>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700" disabled={processingId === "save-edit"}>
          {processingId === "save-edit" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{title}</p>
      <div className="bg-slate-50 rounded-xl border border-slate-100 divide-y divide-slate-100 overflow-hidden">{children}</div>
    </div>
  );
}

function InfoRow({ icon, label, value, mono = false, badge = false, badgeColor = "bg-slate-100 text-slate-600" }: {
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
        <span className={`text-xs font-semibold text-slate-700 text-right break-all ${mono ? "font-mono text-[10px] text-slate-500" : ""}`}>{value}</span>
      )}
    </div>
  );
}
