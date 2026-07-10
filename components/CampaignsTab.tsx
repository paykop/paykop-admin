"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useAdminCampaignsStore } from "../store/useAdminCampaignsStore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "./ui/dialog";
import { HeartHandshake, Loader2, Trash2, Edit, Plus, Check, X } from "lucide-react";
import { CreateCampaignRequest, UpdateCampaignRequest } from "../schemas/campaignSchema";

export default function CampaignsTab() {
  const { getToken } = useAuth();
  const { campaigns, loading, fetchAdminCampaigns, createAdminCampaign, updateAdminCampaign, deleteAdminCampaign } = useAdminCampaignsStore();
  const [processingId, setProcessingId] = useState<number | null>(null);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    target_amount: 0,
    is_urgent: false,
    image_url: "",
  });

  useEffect(() => {
    fetchAdminCampaigns(getToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getToken]);

  const openCreateDialog = () => {
    setEditingCampaign(null);
    setFormData({
      title: "",
      description: "",
      target_amount: 0,
      is_urgent: false,
      image_url: "",
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (campaign: any) => {
    setEditingCampaign(campaign);
    setFormData({
      title: campaign.title,
      description: campaign.description,
      target_amount: campaign.target_amount,
      is_urgent: campaign.is_urgent,
      image_url: campaign.image_url || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCampaign) {
        await updateAdminCampaign(getToken, editingCampaign.id, formData);
      } else {
        await createAdminCampaign(getToken, formData);
      }
      setIsDialogOpen(false);
    } catch (error) {
      alert("Failed to save campaign");
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    setProcessingId(id);
    await updateAdminCampaign(getToken, id, { status });
    setProcessingId(null);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this campaign?")) {
      setProcessingId(id);
      await deleteAdminCampaign(getToken, id);
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Donation Campaigns</h2>
          <p className="text-sm text-slate-500 mt-0.5">Manage platform donation campaigns.</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 px-4 rounded-lg flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Campaign
        </Button>
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
                  <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Target</TableHead>
                  <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Creator</TableHead>
                  <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Status</TableHead>
                  <TableHead className="p-4 pr-6 text-right text-slate-400 font-bold uppercase tracking-wider text-[10px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {campaigns.map((c) => (
                  <TableRow key={c.id} className="hover:bg-slate-50/50 transition border-b border-slate-100">
                    <TableCell className="p-4 pl-6 font-bold text-slate-800 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${c.is_urgent ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"}`}>
                        <HeartHandshake className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="truncate max-w-[250px]">{c.title} {c.is_urgent && <span className="text-red-500 text-[10px] ml-1 uppercase border border-red-200 bg-red-50 px-1 py-0.5 rounded">Urgent</span>}</div>
                        <div className="text-[10px] text-slate-400 font-normal truncate max-w-[250px]">{c.description}</div>
                      </div>
                    </TableCell>
                    <TableCell className="p-4">
                      <div className="text-slate-800 font-bold">₹{(c.target_amount / 100).toFixed(2)}</div>
                    </TableCell>
                    {/* creator_id — July 2026 */}
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
                      ) : (
                        <div className="flex justify-end gap-2">
                           {c.status === "pending" && (
                            <Button
                              onClick={() => handleUpdateStatus(c.id, "approved")}
                              variant="outline"
                              className="h-7 px-2 rounded border border-emerald-200 hover:bg-emerald-50 text-emerald-600 text-[10px] inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3 h-3" /> Approve
                            </Button>
                          )}
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
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingCampaign ? "Edit Campaign" : "Create Campaign"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-xs font-bold text-slate-700">Title</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full text-sm p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-bold text-slate-700">Description</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full text-sm p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-bold text-slate-700">Target Amount (in paise)</label>
                <input
                  required
                  type="number"
                  min="1"
                  value={formData.target_amount}
                  onChange={(e) => setFormData({ ...formData, target_amount: parseInt(e.target.value) || 0 })}
                  className="w-full text-sm p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="urgent"
                  checked={formData.is_urgent}
                  onChange={(e) => setFormData({ ...formData, is_urgent: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="urgent" className="text-xs font-bold text-slate-700">Mark as Urgent</label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-lg h-9">
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-9">
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
