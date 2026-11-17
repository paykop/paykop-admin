"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/useAuth";
import { useUserStore } from "../store/useUserStore";
import { isAdmin } from "@/lib/rbac";
import { useAdminCampaignsStore } from "../store/useAdminCampaignsStore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { HeartHandshake, Loader2, Trash2, Edit, Plus, Droplet } from "lucide-react";
import { CreateCampaignRequest, UpdateCampaignRequest, CampaignItem } from "../schemas/campaignSchema";
import { toast } from "./ui/toast";
import { getErrorMessage } from "../lib/errors";

export default function CampaignsTab() {
  const { getToken } = useAuth();
  const backendUser = useUserStore((s) => s.backendUser);
  const canManage = isAdmin(backendUser?.role);
  const { campaigns, loading, fetchAdminCampaigns, createAdminCampaign, updateAdminCampaign, deleteAdminCampaign } = useAdminCampaignsStore();
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<CampaignItem | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    target_amount: 0,
    is_urgent: false,
    image_url: "",
    status: "pending",
  });

  useEffect(() => {
    fetchAdminCampaigns(getToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getToken]);

  const openCreateDialog = () => {
    if (!canManage) return;
    setEditingCampaign(null);
    setFormData({
      title: "",
      description: "",
      target_amount: 0,
      is_urgent: false,
      image_url: "",
      status: "pending",
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (campaign: CampaignItem) => {
    if (!canManage) return;
    setEditingCampaign(campaign);
    setFormData({
      title: campaign.title,
      description: campaign.description,
      target_amount: campaign.target_amount || 0,
      is_urgent: campaign.is_urgent,
      image_url: campaign.image_url || "",
      status: campaign.status || "pending",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage || saving) return;
    setSaving(true);
    try {
      const payload: CreateCampaignRequest | UpdateCampaignRequest = {
        title: formData.title,
        description: formData.description,
        image_url: formData.image_url || undefined,
        target_amount: formData.target_amount,
        is_urgent: formData.is_urgent,
      };

      if (editingCampaign) {
        await updateAdminCampaign(getToken, editingCampaign.id, {
          ...payload,
          status: formData.status,
        });
        toast.success("Campaign updated successfully!");
      } else {
        await createAdminCampaign(getToken, payload as CreateCampaignRequest);
        toast.success("Campaign created successfully!");
      }
      setIsDialogOpen(false);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to save campaign"));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    if (!canManage) return;
    setProcessingId(id);
    try {
      await updateAdminCampaign(getToken, id, { status });
      toast.success(`Status updated to ${status}`);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to update status"));
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!canManage) return;
    if (!confirm("Are you sure you want to delete this campaign?")) return;
    setProcessingId(id);
    try {
      await deleteAdminCampaign(getToken, id);
      toast.success("Campaign deleted");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to delete campaign"));
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Donation Campaigns</h2>
          <p className="text-sm text-slate-500 mt-0.5">Manage platform monetary donation campaigns.</p>
        </div>
        {canManage && (
        <Button onClick={openCreateDialog} className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 px-4 rounded-lg flex items-center gap-2 cursor-pointer">
          <Plus className="w-4 h-4" /> Create Campaign
        </Button>
        )}
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading && campaigns.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center justify-center gap-2">
            <HeartHandshake className="w-10 h-10 text-slate-300" />
            <p className="text-slate-800 font-bold text-sm">No campaigns found</p>
            <p className="text-xs text-slate-400">Create a new donation campaign to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="text-xs">
              <TableHeader className="bg-slate-50">
                <TableRow className="border-b border-slate-100 hover:bg-transparent">
                  <TableHead className="p-4 pl-6 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Campaign</TableHead>
                  <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Type</TableHead>
                  <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Target</TableHead>
                  <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Creator</TableHead>
                  <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Status</TableHead>
                  <TableHead className="p-4 pr-6 text-right text-slate-400 font-bold uppercase tracking-wider text-[10px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {campaigns.map((c) => {
                  const isBloodType = c.type === "blood";
                  return (
                    <TableRow key={c.id} className="hover:bg-slate-50/50 transition border-b border-slate-100">
                      <TableCell className="p-4 pl-6 font-bold text-slate-800 flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isBloodType ? "bg-rose-50 text-rose-600" : c.is_urgent ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"}`}>
                          {isBloodType ? <Droplet className="w-4 h-4" /> : <HeartHandshake className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="truncate max-w-[250px]">{c.title} {c.is_urgent && <span className="text-red-500 text-[10px] ml-1 uppercase border border-red-200 bg-red-50 px-1 py-0.5 rounded font-bold">Urgent</span>}</div>
                          <div className="text-[10px] text-slate-400 font-normal truncate max-w-[250px]">{c.description}</div>
                        </div>
                      </TableCell>
                      <TableCell className="p-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${isBloodType ? "bg-rose-50 text-rose-600 border border-rose-200" : "bg-blue-50 text-blue-600 border border-blue-200"}`}>
                          {isBloodType ? "Blood Request" : "Cash Donation"}
                        </span>
                      </TableCell>
                      <TableCell className="p-4">
                        {isBloodType ? (
                          <span className="text-slate-400 font-bold text-[11px]">N/A (Blood Request)</span>
                        ) : (
                          <div className="text-slate-800 font-bold">₹{(c.target_amount / 100).toFixed(2)}</div>
                        )}
                      </TableCell>
                      <TableCell className="p-4">
                        {c.creator_id ? (
                          <span className="inline-flex px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 text-[10px] font-mono font-bold truncate max-w-[100px]" title={c.creator_id}>
                            {c.creator_id.slice(0, 12)}…
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 text-[10px] font-bold">Admin</span>
                        )}
                      </TableCell>
                      <TableCell className="p-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                          c.status === "approved" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" :
                          c.status === "pending" ? "bg-amber-50 text-amber-600 border border-amber-200" :
                          "bg-red-50 text-red-600 border border-red-200"
                        }`}>
                          {c.status}
                        </span>
                      </TableCell>
                      <TableCell className="p-4 pr-6 text-right space-x-2 whitespace-nowrap">
                        {processingId === c.id ? (
                          <Loader2 className="w-4 h-4 animate-spin inline-block text-blue-500" />
                        ) : canManage ? (
                          <div className="flex justify-end gap-2 items-center flex-wrap">
                            <select
                              value={c.status}
                              onChange={(e) => handleUpdateStatus(c.id, e.target.value)}
                              className="h-7 px-2 rounded border border-slate-200 text-[10px] font-bold bg-white cursor-pointer"
                            >
                              {["pending", "approved", "rejected", "active", "paused", "completed", "closed"].map((st) => (
                                <option key={st} value={st}>{st}</option>
                              ))}
                            </select>
                            <Button
                              onClick={() => openEditDialog(c)}
                              variant="outline"
                              className="h-7 px-2 rounded border border-blue-200 hover:bg-blue-50 text-blue-600 text-[10px] inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Edit className="w-3 h-3" /> Edit
                            </Button>
                            <Button
                              onClick={() => handleDelete(c.id)}
                              variant="outline"
                              className="h-7 px-2 rounded border border-red-200 hover:bg-red-50 text-red-500 text-[10px] inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </Button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400">View only</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-md max-h-[85vh] overflow-y-auto bg-white border border-slate-200 rounded-2xl p-6">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingCampaign ? "Edit Campaign" : "Create Campaign"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-xs font-bold text-slate-700">Title *</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Flood Relief Fund"
                  className="w-full text-sm p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-bold text-slate-700">Description *</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full text-sm p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-bold text-slate-700">Image URL</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full text-sm p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-bold text-slate-700">Target Amount (paise) *</label>
                <input
                  required
                  type="number"
                  min="0"
                  value={formData.target_amount}
                  onChange={(e) => setFormData({ ...formData, target_amount: parseInt(e.target.value) || 0 })}
                  className="w-full text-sm p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {editingCampaign && (
                <div className="grid gap-2">
                  <label className="text-xs font-bold text-slate-700">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full text-sm p-2 rounded-lg border border-slate-200 bg-white"
                  >
                    {["pending", "approved", "rejected", "active", "paused", "completed", "closed"].map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="urgent"
                  checked={formData.is_urgent}
                  onChange={(e) => setFormData({ ...formData, is_urgent: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="urgent" className="text-xs font-bold text-slate-700 cursor-pointer">Mark as Urgent</label>
              </div>
            </div>
            <DialogFooter className="flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-lg h-9 cursor-pointer">
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-9 cursor-pointer">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
