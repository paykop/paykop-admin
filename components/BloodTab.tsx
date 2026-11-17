// src/components/BloodTab.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/useAuth";
import { useUserStore } from "../store/useUserStore";
import { isAdmin } from "@/lib/rbac";
import { useAdminBloodStore } from "../store/useAdminBloodStore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Droplet,
  Loader2,
  Check,
  X,
  CheckCircle,
  Sparkles,
  Users,
  Search,
  Phone,
  AlertCircle,
  Trash2,
  Ban,
  Edit,
} from "lucide-react";
import { toast } from "./ui/toast";
import { BloodRequestItem } from "../schemas/bloodSchema";
import { getErrorMessage } from "../lib/errors";

export default function BloodTab() {
  const { getToken } = useAuth();
  const backendUser = useUserStore((s) => s.backendUser);
  const canMutateBlood = isAdmin(backendUser?.role);
  const {
    requests,
    loading,
    statusFilter,
    setStatusFilter,
    fetchAdminBloodRequests,
    updateAdminBloodRequestStatus,
    updateAdminBloodRequest,
    deleteAdminBloodRequest,
    donors,
    donorsLoading,
    fetchDonorsDirectory,
    matchingDonors,
    matchingLoading,
    fetchAutoMatchingDonors,
    clearMatchingDonors,
  } = useAdminBloodStore();

  const [activeTab, setActiveTab] = useState<"requests" | "donors">("requests");
  const [processingId, setProcessingId] = useState<string | number | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<BloodRequestItem | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    patient_name: "",
    blood_type: "A+",
    units_needed: "1",
    hospital: "",
    contact_phone: "",
    address: "",
    city_id: "",
    status: "pending",
  });
  const [editingId, setEditingId] = useState<string | number | null>(null);

  // Donor directory filter state
  const [donorBloodType, setDonorBloodType] = useState<string>("all");
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(true);

  // Initial fetch for emergency requests
  useEffect(() => {
    fetchAdminBloodRequests(getToken, 1, 50, statusFilter);
  }, [getToken, statusFilter, fetchAdminBloodRequests]);

  // Initial fetch for donor directory when switching tab or filter
  useEffect(() => {
    if (activeTab === "donors") {
      fetchDonorsDirectory(getToken, {
        blood_type: donorBloodType !== "all" ? donorBloodType : undefined,
        only_available: onlyAvailable,
      });
    }
  }, [getToken, activeTab, donorBloodType, onlyAvailable, fetchDonorsDirectory]);

  const handleUpdateStatus = async (id: string | number, status: string) => {
    if (!canMutateBlood) return;
    setProcessingId(id);
    try {
      await updateAdminBloodRequestStatus(getToken, id, status);
      toast.success(`Blood request status updated to "${status}"!`);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to update blood request status."));
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!canMutateBlood) return;
    if (!confirm("Delete this blood donation request?")) return;
    setProcessingId(id);
    try {
      await deleteAdminBloodRequest(getToken, id);
      toast.success("Blood request deleted.");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to delete blood request."));
    } finally {
      setProcessingId(null);
    }
  };

  const openEdit = (r: BloodRequestItem) => {
    setEditingId(r.id);
    setEditForm({
      patient_name: r.patient_name || "",
      blood_type: r.blood_type || "A+",
      units_needed: String(r.units_needed ?? 1),
      hospital: r.hospital || "",
      contact_phone: r.contact_phone || "",
      address: String(r.address || ""),
      city_id: r.city_id != null ? String(r.city_id) : "",
      status: r.status || "pending",
    });
    setEditOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canMutateBlood || editingId == null) return;
    setProcessingId(editingId);
    try {
      const payload: Record<string, unknown> = {
        patient_name: editForm.patient_name,
        blood_type: editForm.blood_type,
        units_needed: parseInt(editForm.units_needed, 10) || 1,
        hospital: editForm.hospital,
        contact_phone: editForm.contact_phone,
        status: editForm.status,
      };
      if (editForm.address.trim()) payload.address = editForm.address.trim();
      if (editForm.city_id.trim()) payload.city_id = parseInt(editForm.city_id, 10);
      await updateAdminBloodRequest(getToken, editingId, payload);
      toast.success("Blood request updated.");
      setEditOpen(false);
      setEditingId(null);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to update blood request."));
    } finally {
      setProcessingId(null);
    }
  };

  const handleOpenMatchingDonors = async (req: BloodRequestItem) => {
    setSelectedRequest(req);
    await fetchAutoMatchingDonors(getToken, req.id);
  };

  const handleCloseModal = () => {
    setSelectedRequest(null);
    clearMatchingDonors();
  };

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const statusPills = ["all", "pending", "approved", "fulfilled", "cancelled", "rejected"];

  return (
    <div className="space-y-6">
      {/* Header & Sub-Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="p-2 bg-red-50 text-red-600 rounded-xl border border-red-100">
              <Droplet className="w-6 h-6 fill-red-500 text-red-500" />
            </span>
            Blood Donations & Donor Network
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Coordinate emergency transfusion requests and manage the standing volunteer donor directory.
          </p>
        </div>

        {/* Primary View Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-start md:self-auto">
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === "requests"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Droplet className="w-3.5 h-3.5 text-red-500" />
            Emergency Requests
            {requests.length > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">
                {requests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("donors")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === "donors"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users className="w-3.5 h-3.5 text-blue-500" />
            Standing Donor Directory
          </button>
        </div>
      </div>

      {/* VIEW 1: EMERGENCY REQUESTS */}
      {activeTab === "requests" && (
        <div className="space-y-4">
          {/* Status Filter Pills */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-bold text-slate-400 uppercase mr-1">Filter by Status:</span>
            {statusPills.map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition cursor-pointer ${
                  statusFilter === st
                    ? "bg-red-600 text-white shadow-sm shadow-red-500/20"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {st.replace("_", " ")}
              </button>
            ))}
          </div>

          {/* Main Requests Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {loading && requests.length === 0 ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-red-500" />
              </div>
            ) : requests.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
                <Droplet className="w-10 h-10 text-slate-300" />
                <p className="text-slate-800 font-bold text-sm">No blood requests found</p>
                <p className="text-xs text-slate-400">
                  There are no requests matching the selected filter status &quot;{statusFilter}&quot;.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="text-xs">
                  <TableHeader className="bg-slate-50/80">
                    <TableRow className="border-b border-slate-100 hover:bg-transparent">
                      <TableHead className="p-4 pl-6 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Patient & Units</TableHead>
                      <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Hospital & Contact</TableHead>
                      <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Status</TableHead>
                      <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Match Suggestion</TableHead>
                      <TableHead className="p-4 pr-6 text-right text-slate-400 font-bold uppercase tracking-wider text-[10px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-100">
                    {requests.map((r) => (
                      <TableRow key={r.id} className="hover:bg-slate-50/50 transition border-b border-slate-100">
                        <TableCell className="p-4 pl-6 font-bold text-slate-800 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 font-black text-sm flex items-center justify-center shrink-0 border border-red-100 shadow-sm">
                            {r.blood_type}
                          </div>
                          <div>
                            <div className="truncate max-w-[200px] text-slate-900 font-bold text-xs">{r.patient_name}</div>
                            <div className="text-[10px] text-slate-500 font-medium">{r.units_needed} unit(s) needed</div>
                          </div>
                        </TableCell>
                        <TableCell className="p-4">
                          <div className="text-slate-800 font-semibold truncate max-w-[220px]">{r.hospital}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-300" />
                            {r.contact_phone}
                          </div>
                        </TableCell>
                        <TableCell className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                            r.status === "approved" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                            r.status === "fulfilled" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                            r.status === "pending" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                            r.status === "cancelled" ? "bg-slate-100 text-slate-600 border border-slate-200" :
                            "bg-red-50 text-red-600 border border-red-200"
                          }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {r.status?.replace("_", " ")}
                          </span>
                        </TableCell>
                        <TableCell className="p-4">
                          <Button
                            onClick={() => handleOpenMatchingDonors(r)}
                            variant="outline"
                            className="h-7 px-2.5 rounded-lg border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/70 text-indigo-700 text-[10px] font-bold inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3 text-indigo-600" />
                            Auto-Match Donors
                          </Button>
                        </TableCell>
                        <TableCell className="p-4 pr-6 text-right space-x-1.5 whitespace-nowrap">
                          {processingId === r.id ? (
                            <Loader2 className="w-4 h-4 animate-spin inline-block text-red-500" />
                          ) : canMutateBlood ? (
                            <div className="flex justify-end gap-1.5 flex-wrap">
                              <Button
                                onClick={() => openEdit(r)}
                                variant="outline"
                                className="h-7 px-2.5 rounded-lg border-slate-200 hover:bg-slate-50 text-slate-600 text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Edit className="w-3 h-3" /> Edit
                              </Button>
                              {r.status === "pending" && (
                                <>
                                  <Button
                                    onClick={() => handleUpdateStatus(r.id, "approved")}
                                    variant="outline"
                                    className="h-7 px-2.5 rounded-lg border-blue-200 hover:bg-blue-50 text-blue-600 text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer"
                                  >
                                    <Check className="w-3 h-3" /> Approve
                                  </Button>
                                  <Button
                                    onClick={() => handleUpdateStatus(r.id, "rejected")}
                                    variant="outline"
                                    className="h-7 px-2.5 rounded-lg border-red-200 hover:bg-red-50 text-red-600 text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer"
                                  >
                                    <X className="w-3 h-3" /> Reject
                                  </Button>
                                </>
                              )}
                              {r.status === "approved" && (
                                <>
                                  <Button
                                    onClick={() => handleUpdateStatus(r.id, "fulfilled")}
                                    variant="outline"
                                    className="h-7 px-2.5 rounded-lg border-emerald-200 hover:bg-emerald-50 text-emerald-700 text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer"
                                  >
                                    <CheckCircle className="w-3 h-3" /> Mark Fulfilled
                                  </Button>
                                  <Button
                                    onClick={() => handleUpdateStatus(r.id, "cancelled")}
                                    variant="outline"
                                    className="h-7 px-2.5 rounded-lg border-slate-200 hover:bg-slate-50 text-slate-600 text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer"
                                  >
                                    <Ban className="w-3 h-3" /> Cancel
                                  </Button>
                                </>
                              )}
                              {!["fulfilled", "cancelled", "rejected"].includes(r.status || "") && (
                                <Button
                                  onClick={() => handleDelete(r.id)}
                                  variant="outline"
                                  className="h-7 px-2.5 rounded-lg border-red-200 hover:bg-red-50 text-red-500 text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" /> Delete
                                </Button>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400">View only</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: STANDING VOLUNTEER DONORS DIRECTORY */}
      {activeTab === "donors" && (
        <div className="space-y-4">
          {/* Donors Filter Bar */}
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-slate-500 uppercase">Blood Type:</span>
              <select
                value={donorBloodType}
                onChange={(e) => setDonorBloodType(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2 font-bold focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Blood Groups</option>
                {bloodTypes.map((bt) => (
                  <option key={bt} value={bt}>{bt}</option>
                ))}
              </select>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 ml-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={(e) => setOnlyAvailable(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                Only Active & Available Donors
              </label>
            </div>

            <Button
              onClick={() =>
                fetchDonorsDirectory(getToken, {
                  blood_type: donorBloodType !== "all" ? donorBloodType : undefined,
                  only_available: onlyAvailable,
                })
              }
              variant="outline"
              className="h-8 px-3 rounded-xl border-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              Refresh Donors
            </Button>
          </div>

          {/* Donors Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {donorsLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : donors.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
                <Users className="w-10 h-10 text-slate-300" />
                <p className="text-slate-800 font-bold text-sm">No volunteer donors found</p>
                <p className="text-xs text-slate-400">Try modifying your blood type filter.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="text-xs">
                  <TableHeader className="bg-slate-50/80">
                    <TableRow className="border-b border-slate-100 hover:bg-transparent">
                      <TableHead className="p-4 pl-6 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Donor</TableHead>
                      <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Blood Group</TableHead>
                      <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Contact Info</TableHead>
                      <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">City</TableHead>
                      <TableHead className="p-4 pr-6 text-right text-slate-400 font-bold uppercase tracking-wider text-[10px]">Availability</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-100">
                    {donors.map((d, idx) => (
                      <TableRow key={d.id || idx} className="hover:bg-slate-50/50 transition border-b border-slate-100">
                        <TableCell className="p-4 pl-6 font-bold text-slate-800">
                          <div>
                            <span className="text-xs text-slate-900 font-bold">
                              {d.name || d.full_name || "Registered Volunteer"}
                            </span>
                            <div className="text-[10px] text-slate-400 font-mono">{d.user_id ? `ID: ${d.user_id}` : ""}</div>
                          </div>
                        </TableCell>
                        <TableCell className="p-4">
                          <span className="px-2.5 py-1 rounded-lg bg-red-50 text-red-600 font-black text-xs border border-red-100">
                            {d.blood_type}
                          </span>
                        </TableCell>
                        <TableCell className="p-4 text-slate-700 font-medium">
                          {d.phone || d.contact_phone || "Contact on request"}
                        </TableCell>
                        <TableCell className="p-4 text-slate-600 font-medium">
                          {d.city_name || (d.city_id ? `City #${d.city_id}` : "Not specified")}
                        </TableCell>
                        <TableCell className="p-4 pr-6 text-right">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                            d.is_available !== false
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-500"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${d.is_available !== false ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                            {d.is_available !== false ? "Available" : "Unavailable"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* EDIT BLOOD REQUEST MODAL */}
      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditingId(null);
        }}
      >
        <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-md max-h-[85vh] overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-left text-slate-800">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">Edit Blood Request</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="mt-4 space-y-3 text-xs">
            <div>
              <label className="block font-semibold mb-1 text-slate-500 uppercase tracking-wider">Patient Name</label>
              <input
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                value={editForm.patient_name}
                onChange={(e) => setEditForm({ ...editForm, patient_name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-slate-500 uppercase tracking-wider">Blood Type</label>
                <select
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  value={editForm.blood_type}
                  onChange={(e) => setEditForm({ ...editForm, blood_type: e.target.value })}
                >
                  {bloodTypes.map((bt) => (
                    <option key={bt} value={bt}>{bt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-500 uppercase tracking-wider">Units Needed</label>
                <input
                  type="number"
                  min={1}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  value={editForm.units_needed}
                  onChange={(e) => setEditForm({ ...editForm, units_needed: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold mb-1 text-slate-500 uppercase tracking-wider">Hospital</label>
              <input
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                value={editForm.hospital}
                onChange={(e) => setEditForm({ ...editForm, hospital: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-slate-500 uppercase tracking-wider">Contact Phone</label>
              <input
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                value={editForm.contact_phone}
                onChange={(e) => setEditForm({ ...editForm, contact_phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-slate-500 uppercase tracking-wider">Address</label>
              <input
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-slate-500 uppercase tracking-wider">City ID</label>
                <input
                  type="number"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  value={editForm.city_id}
                  onChange={(e) => setEditForm({ ...editForm, city_id: e.target.value })}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-500 uppercase tracking-wider">Status</label>
                <select
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                >
                  {statusPills.filter((s) => s !== "all").map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
                className="h-9 px-4 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={processingId === editingId}
                className="h-9 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer"
              >
                {processingId === editingId ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* AUTO-MATCHING DONORS MODAL */}
      <Dialog open={!!selectedRequest} onOpenChange={handleCloseModal}>
        <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-2xl max-h-[85vh] overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-left text-slate-800">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <span>Suggested Donors for {selectedRequest?.patient_name}</span>
              </div>
              {selectedRequest && (
                <span className="px-2.5 py-0.5 rounded-lg bg-red-50 text-red-600 font-black text-xs border border-red-100">
                  {selectedRequest.blood_type} Needed
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            {matchingLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                <p className="text-xs text-slate-500 font-semibold">Querying nearest standing donors matching {selectedRequest?.blood_type}...</p>
              </div>
            ) : matchingDonors.length === 0 ? (
              <div className="py-10 text-center flex flex-col items-center justify-center gap-2 bg-slate-50 rounded-xl border border-dashed border-slate-200 p-6">
                <AlertCircle className="w-8 h-8 text-amber-500" />
                <p className="text-slate-800 font-bold text-xs">No active donors currently matched</p>
                <p className="text-[11px] text-slate-400">
                  Consider checking the full Standing Donor Directory or broadcasting an urgent notification.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {matchingDonors.map((d, i) => (
                  <div
                    key={d.id || i}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 font-black text-xs flex items-center justify-center shrink-0">
                        {d.blood_type}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{d.name || d.full_name || "Matched Donor"}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{d.city_name || (d.city_id ? `City #${d.city_id}` : "Nearby")}</span>
                          {d.phone && <span className="font-mono text-slate-600 font-semibold">• {d.phone}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full border font-bold text-[10px] ${
                          d.is_available !== false
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : "bg-slate-100 border-slate-200 text-slate-500"
                        }`}
                      >
                        {d.is_available !== false ? "Available" : "Unavailable"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button
                onClick={handleCloseModal}
                variant="outline"
                className="h-9 px-4 rounded-xl border-slate-200 text-xs font-semibold cursor-pointer"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
