// src/components/ServiceCategoriesTab.tsx
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/useAuth";
import { useUserStore } from "../store/useUserStore";
import { isAdmin } from "@/lib/rbac";
import { useAdminServiceCategoriesStore } from "../store/useAdminServiceCategoriesStore";
import { ServiceCategoryItem, CreateServiceCategoryRequest } from "../schemas/serviceCategorySchema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Loader2, Plus, Edit, Trash2, LayoutGrid, Star, Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "./ui/toast";
import { uploadImageFile } from "../services/uploadService";
import { getErrorMessage } from "../lib/errors";

const EMPTY_FORM = {
  name: "",
  type: "",
  parent_id: "" as string | number,
  icon: "",
  subtitle: "",
  icon_color: "#6366f1",
  bg_color: "#eef2ff",
  is_featured: false,
  image_url: "",
};

// Helper to recursively flatten category tree nodes (handles both nested tree and flat array responses)
const flattenCategoriesTree = (
  items: ServiceCategoryItem[],
  depth = 0,
  visited = new Set<number>()
): (ServiceCategoryItem & { depth: number })[] => {
  let result: (ServiceCategoryItem & { depth: number })[] = [];
  for (const item of items) {
    if (visited.has(item.id)) continue;
    visited.add(item.id);
    result.push({ ...item, depth });
    if (item.children && Array.isArray(item.children) && item.children.length > 0) {
      result = result.concat(flattenCategoriesTree(item.children, depth + 1, visited));
    }
  }
  return result;
};

export default function ServiceCategoriesTab() {
  const { getToken } = useAuth();
  const backendUser = useUserStore((s) => s.backendUser);
  const canManage = isAdmin(backendUser?.role);
  const { categories, loading, error, fetchCategories, createCategory, updateCategory, deleteCategory } =
    useAdminServiceCategoriesStore();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ServiceCategoryItem | null>(null);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Flatten nested children tree nodes into a display list
  const displayCategories = flattenCategoriesTree(categories);
  const rootCategories = displayCategories.filter((c) => !c.parent_id);

  useEffect(() => {
    fetchCategories(getToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getToken]);

  const openCreate = (parentId?: number, type?: string) => {
    setEditingItem(null);
    setFormData({
      ...EMPTY_FORM,
      parent_id: parentId ?? "",
      type: type ?? "",
    });
    setIsDialogOpen(true);
  };

  const openEdit = (item: ServiceCategoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      type: item.type,
      parent_id: item.parent_id ?? "",
      icon: item.icon ?? "",
      subtitle: item.subtitle ?? "",
      icon_color: item.icon_color ?? "#6366f1",
      bg_color: item.bg_color ?? "#eef2ff",
      is_featured: item.is_featured ?? false,
      image_url: item.image_url ?? "",
    });
    setIsDialogOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication token unavailable");
      const publicUrl = await uploadImageFile(token, file);
      setFormData((prev) => ({ ...prev, image_url: publicUrl }));
      toast.success("Photo uploaded successfully!");
    } catch (err: unknown) {
      console.error("Image upload failed:", err);
      toast.error(getErrorMessage(err, "Failed to upload image photo."));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: CreateServiceCategoryRequest = {
        name: formData.name,
        type: formData.type,
        icon: formData.icon || undefined,
        subtitle: formData.subtitle || undefined,
        icon_color: formData.icon_color || undefined,
        bg_color: formData.bg_color || undefined,
        is_featured: formData.is_featured,
        parent_id: formData.parent_id !== "" ? Number(formData.parent_id) : null,
        image_url: formData.image_url.trim() || null,
      };

      if (editingItem) {
        await updateCategory(getToken, editingItem.id, payload);
        toast.success("Service category updated successfully!");
      } else {
        await createCategory(getToken, payload);
        toast.success("Service category created successfully!");
      }
      setIsDialogOpen(false);
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "");
      if (msg.includes("duplicate key") || msg.includes("23505") || msg.includes("already exists")) {
        toast.error("A service category with this name already exists. Please choose a unique name.", "Duplicate Category");
      } else {
        toast.error(msg || "Failed to save service category.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this service category?")) return;
    setDeletingId(id);
    try {
      await deleteCategory(getToken, id);
      toast.success("Service category deleted successfully!");
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "");
      if (msg.includes("in use") || msg.includes("cannot be modified or deleted")) {
        toast.error(
          "Cannot delete category because it has linked services or subcategories. Please reassign or delete dependent services/subcategories first.",
          "Category In Use"
        );
      } else {
        toast.error(msg || "Failed to delete category.");
      }
    } finally {
      setDeletingId(null);
    }
  };

  const getParentName = (parentId?: number | null) => {
    if (!parentId) return null;
    return displayCategories.find((c) => c.id === parentId)?.name ?? `#${parentId}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Service Categories</h2>
          <p className="text-sm text-slate-500 mt-0.5">Manage platform service categories and subcategories with custom photos.</p>
        </div>
        {canManage && (
        <Button onClick={() => openCreate()} className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 px-4 rounded-lg flex items-center gap-2 cursor-pointer">
          <Plus className="w-4 h-4" /> Add Category
        </Button>
        )}
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading && displayCategories.length === 0 ? (
          <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
        ) : displayCategories.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-3">
            <LayoutGrid className="w-10 h-10 text-slate-300" />
            <p className="text-slate-800 font-bold text-sm">No categories found</p>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              Create service categories and subcategories with uploaded photo banners via
              <code className="mx-1 px-1 py-0.5 rounded bg-slate-100 font-mono text-[10px]">POST /admin/service-categories</code>.
            </p>
            <Button onClick={() => openCreate()} className="mt-1 bg-blue-600 hover:bg-blue-700 text-white font-bold h-8 px-4 rounded-lg flex items-center gap-2 text-xs cursor-pointer">
              <Plus className="w-3.5 h-3.5" /> Try Creating One
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="text-xs">
              <TableHeader className="bg-slate-50">
                <TableRow className="border-b border-slate-100 hover:bg-transparent">
                  <TableHead className="p-4 pl-6 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Name</TableHead>
                  <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Type</TableHead>
                  <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Parent</TableHead>
                  <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Colors</TableHead>
                  <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Featured</TableHead>
                  <TableHead className="p-4 pr-6 text-right text-slate-400 font-bold uppercase tracking-wider text-[10px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {displayCategories.map((cat) => (
                  <TableRow key={cat.id} className="hover:bg-slate-50/50 transition border-b border-slate-100">
                    <TableCell className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        {/* Photo / Icon preview */}
                        {cat.image_url ? (
                          <Image
                            src={cat.image_url}
                            alt={cat.name}
                            width={36}
                            height={36}
                            unoptimized
                            className="w-9 h-9 rounded-lg object-cover border border-slate-200 shadow-sm shrink-0 bg-slate-50"
                          />
                        ) : (
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold border border-slate-200"
                            style={{ backgroundColor: cat.bg_color || "#f1f5f9", color: cat.icon_color || "#6366f1" }}
                          >
                            {cat.icon ? cat.icon.slice(0, 2).toUpperCase() : <LayoutGrid className="w-4 h-4" />}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-800 text-[13px]">{cat.name}</div>
                          {cat.subtitle && <div className="text-[11px] text-slate-400">{cat.subtitle}</div>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="p-4">
                      <span className="inline-flex px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold capitalize">{cat.type}</span>
                    </TableCell>
                    <TableCell className="p-4">
                      {cat.parent_id ? (
                        <span className="inline-flex px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 text-[10px] font-bold">{getParentName(cat.parent_id)}</span>
                      ) : (
                        <span className="text-slate-300 text-[10px] font-bold">Root</span>
                      )}
                    </TableCell>
                    <TableCell className="p-4">
                      <div className="flex items-center gap-2">
                        {cat.icon_color && (
                          <div className="flex items-center gap-1">
                            <div className="w-4 h-4 rounded-full border border-slate-200 shadow-sm" style={{ backgroundColor: cat.icon_color }} />
                            <span className="text-[10px] text-slate-400 font-mono">{cat.icon_color}</span>
                          </div>
                        )}
                        {cat.bg_color && (
                          <div className="flex items-center gap-1">
                            <div className="w-4 h-4 rounded-full border border-slate-200 shadow-sm" style={{ backgroundColor: cat.bg_color }} />
                            <span className="text-[10px] text-slate-400 font-mono">{cat.bg_color}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="p-4">
                      {cat.is_featured ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-600 text-[10px] font-bold">
                          <Star className="w-2.5 h-2.5" /> Featured
                        </span>
                      ) : (
                        <span className="text-slate-300 text-[10px] font-bold">—</span>
                      )}
                    </TableCell>
                    <TableCell className="p-4 pr-6 text-right">
                      {deletingId === cat.id ? (
                        <Loader2 className="w-4 h-4 animate-spin inline-block text-blue-500" />
                      ) : canManage ? (
                        <div className="flex justify-end gap-2">
                          {!cat.parent_id && (
                            <Button onClick={() => openCreate(cat.id, cat.type)} variant="outline" className="h-7 px-2 rounded border border-indigo-200 hover:bg-indigo-50 text-indigo-600 text-[10px] inline-flex items-center gap-1 cursor-pointer">
                              <Plus className="w-3 h-3" /> Subcategory
                            </Button>
                          )}
                          <Button onClick={() => openEdit(cat)} variant="outline" className="h-7 px-2 rounded border border-blue-200 hover:bg-blue-50 text-blue-600 text-[10px] inline-flex items-center gap-1 cursor-pointer">
                            <Edit className="w-3 h-3" /> Edit
                          </Button>
                          <Button onClick={() => handleDelete(cat.id)} variant="outline" className="h-7 px-2 rounded border border-red-200 hover:bg-red-50 text-red-500 text-[10px] inline-flex items-center gap-1 cursor-pointer">
                            <Trash2 className="w-3 h-3" /> Delete
                          </Button>
                        </div>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Service Category" : "Create Service Category"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4 text-sm">
              {/* Name + Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Name *</label>
                  <input required maxLength={100} value={formData.name} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} placeholder="e.g. Cardiology" className="w-full p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Type *</label>
                  <input required maxLength={50} value={formData.type} onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))} placeholder="e.g. health" className="w-full p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
              </div>

              {/* Subtitle + Icon */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Subtitle</label>
                  <input value={formData.subtitle} onChange={(e) => setFormData((prev) => ({ ...prev, subtitle: e.target.value }))} placeholder="Short description" className="w-full p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Icon (name/emoji)</label>
                  <input value={formData.icon} onChange={(e) => setFormData((prev) => ({ ...prev, icon: e.target.value }))} placeholder="e.g. heart or 🏥" className="w-full p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
              </div>

              {/* Parent */}
              <div className="grid gap-1.5">
                <label className="text-xs font-bold text-slate-700">Parent Category (optional for subcategories)</label>
                <select value={formData.parent_id} onChange={(e) => setFormData((prev) => ({ ...prev, parent_id: e.target.value }))} className="w-full p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white">
                  <option value="">None (Root category)</option>
                  {rootCategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Colors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Icon Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={formData.icon_color} onChange={(e) => setFormData((prev) => ({ ...prev, icon_color: e.target.value }))} className="w-8 h-8 rounded cursor-pointer border border-slate-200 p-0.5" />
                    <input value={formData.icon_color} onChange={(e) => setFormData((prev) => ({ ...prev, icon_color: e.target.value }))} className="flex-1 p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-mono" />
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <label className="text-xs font-bold text-slate-700">Background Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={formData.bg_color} onChange={(e) => setFormData((prev) => ({ ...prev, bg_color: e.target.value }))} className="w-8 h-8 rounded cursor-pointer border border-slate-200 p-0.5" />
                    <input value={formData.bg_color} onChange={(e) => setFormData((prev) => ({ ...prev, bg_color: e.target.value }))} className="flex-1 p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-mono" />
                  </div>
                </div>
              </div>

              {/* Photo Upload & URL Field */}
              <div className="grid gap-2 border-t border-slate-100 pt-3">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Category Photo / Thumbnail</span>
                  <span className="text-[10px] text-slate-400 font-normal">File upload or URL</span>
                </label>

                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-lg transition shrink-0">
                    {uploadingImage ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-blue-600" />
                    )}
                    <span>{uploadingImage ? "Uploading..." : "Upload Photo"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={uploadingImage}
                    />
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData((prev) => ({ ...prev, image_url: e.target.value }))}
                    placeholder="https://... or upload photo"
                    className="flex-1 p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-mono"
                  />
                </div>

                {/* Live Image Preview */}
                {formData.image_url ? (
                  <div className="mt-1 flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                    <Image
                      src={formData.image_url}
                      alt="Category Preview"
                      width={48}
                      height={48}
                      unoptimized
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200 shadow-sm shrink-0 bg-white"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-800 truncate">{formData.name || "Category Image"}</p>
                      <p className="text-[10px] text-slate-400 font-mono truncate">{formData.image_url}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-slate-400 text-xs bg-slate-50 border border-dashed border-slate-200 rounded-xl p-3 justify-center">
                    <ImageIcon className="w-4 h-4 text-slate-300" />
                    <span className="text-[11px]">No photo attached yet</span>
                  </div>
                )}
              </div>

              {/* Live Icon Badge Preview */}
              <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shrink-0" style={{ backgroundColor: formData.bg_color, color: formData.icon_color }}>
                  {formData.icon || "?"}
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{formData.name || "Preview"}</p>
                  <p className="text-xs text-slate-400">{formData.subtitle || "Subtitle preview"}</p>
                </div>
              </div>

              {/* Featured */}
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_featured" checked={formData.is_featured} onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                <label htmlFor="is_featured" className="text-xs font-bold text-slate-700">Mark as Featured</label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-lg h-9 cursor-pointer">Cancel</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-9 cursor-pointer" disabled={saving || uploadingImage}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingItem ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

