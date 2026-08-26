"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/useAuth";
import { useUserStore } from "../store/useUserStore";
import { isAdmin } from "@/lib/rbac";
import { useAdminBannersStore } from "../store/useAdminBannersStore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Loader2, Plus, Edit, Trash2, Image as ImageIcon } from "lucide-react";
import { toast } from "./ui/toast";
import { BannerItem } from "../schemas/bannerSchema";
import { getErrorMessage } from "../lib/errors";

const EMPTY = { title: "", image_url: "", type: "home", link_id: "", is_active: true };

export default function BannersTab() {
  const { getToken } = useAuth();
  const backendUser = useUserStore((s) => s.backendUser);
  const canManage = isAdmin(backendUser?.role);
  const { banners, loading, error, fetchBanners, createBanner, updateBanner, deleteBanner } =
    useAdminBannersStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BannerItem | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (canManage) fetchBanners(getToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getToken, canManage]);

  if (!canManage) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
        <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-800 font-bold text-sm">Admin access required</p>
        <p className="text-xs text-slate-400 mt-1">Homepage banners can only be managed by administrators.</p>
      </div>
    );
  }

  const openCreate = () => {
    if (!canManage) return;
    setEditing(null);
    setForm({ ...EMPTY });
    setDialogOpen(true);
  };

  const openEdit = (b: BannerItem) => {
    if (!canManage) return;
    setEditing(b);
    setForm({
      title: b.title || "",
      image_url: b.image_url,
      type: b.type,
      link_id: b.link_id || "",
      is_active: b.is_active,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage || !form.image_url.trim()) return;
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim() || undefined,
        image_url: form.image_url.trim(),
        type: form.type.trim() || "home",
        link_id: form.link_id.trim() || undefined,
        is_active: form.is_active,
      };
      if (editing) {
        await updateBanner(getToken, editing.id, payload);
        toast.success("Banner updated.");
      } else {
        await createBanner(getToken, payload);
        toast.success("Banner created.");
      }
      setDialogOpen(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to save banner."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!canManage) return;
    if (!confirm("Delete this banner?")) return;
    setDeletingId(id);
    try {
      await deleteBanner(getToken, id);
      toast.success("Banner deleted.");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to delete banner."));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Homepage Banners</h2>
          <p className="text-sm text-slate-500 mt-0.5">Promotional banners shown in the mobile app</p>
        </div>
        {canManage && (
          <Button
            onClick={openCreate}
            className="h-9 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-bold text-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New Banner
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {error}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading && banners.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : banners.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center gap-2">
            <ImageIcon className="w-10 h-10 text-slate-300" />
            <p className="text-slate-800 font-bold text-sm">No banners yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="text-xs">
              <TableHeader className="bg-slate-50">
                <TableRow className="border-b border-slate-100 hover:bg-transparent">
                  <TableHead className="p-4 pl-6 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Banner</TableHead>
                  <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Type</TableHead>
                  <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Status</TableHead>
                  <TableHead className="p-4 pr-6 text-right text-slate-400 font-bold uppercase tracking-wider text-[10px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {banners.map((b) => (
                  <TableRow key={b.id} className="hover:bg-slate-50/50 border-b border-slate-100">
                    <TableCell className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        {b.image_url ? (
                          <Image
                            src={b.image_url}
                            alt={b.title || "Banner"}
                            width={56}
                            height={36}
                            unoptimized
                            className="w-14 h-9 rounded-lg object-cover border border-slate-200 bg-slate-50"
                          />
                        ) : (
                          <div className="w-14 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-slate-400" />
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-800">{b.title || "Untitled"}</div>
                          <div className="text-[10px] text-slate-400">ID: {b.id}{b.link_id ? ` · link ${b.link_id}` : ""}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="p-4 font-semibold text-slate-600 capitalize">{b.type}</TableCell>
                    <TableCell className="p-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          b.is_active
                            ? "bg-emerald-50 border border-emerald-200 text-emerald-600"
                            : "bg-slate-100 border border-slate-200 text-slate-500"
                        }`}
                      >
                        {b.is_active ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="p-4 pr-6 text-right">
                      {canManage && (
                        <div className="flex justify-end gap-2">
                          <Button
                            onClick={() => openEdit(b)}
                            variant="outline"
                            className="h-7 px-2 rounded border border-slate-200 text-slate-600 text-[10px] cursor-pointer"
                          >
                            <Edit className="w-3 h-3 mr-1" /> Edit
                          </Button>
                          <Button
                            onClick={() => handleDelete(b.id)}
                            variant="outline"
                            disabled={deletingId === b.id}
                            className="h-7 px-2 rounded border border-red-200 text-red-500 text-[10px] cursor-pointer"
                          >
                            {deletingId === b.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <>
                                <Trash2 className="w-3 h-3 mr-1" /> Delete
                              </>
                            )}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-md max-h-[85vh] overflow-y-auto bg-white border border-slate-200 rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {editing ? "Edit Banner" : "Create Banner"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3 text-xs pt-2">
            <div>
              <label className="block font-semibold mb-1 text-slate-500 uppercase tracking-wider">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Optional title"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-slate-500 uppercase tracking-wider">Image URL</label>
              <input
                required
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="https://..."
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold mb-1 text-slate-500 uppercase tracking-wider">Type</label>
                <input
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-500 uppercase tracking-wider">Link ID</label>
                <input
                  value={form.link_id}
                  onChange={(e) => setForm({ ...form, link_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
              Active
            </label>
            <DialogFooter className="pt-2">
              <Button
                type="submit"
                disabled={saving}
                className="w-full bg-blue-600 text-white font-bold h-9 rounded-lg cursor-pointer"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Banner"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
