// src/components/ProductCategoriesTab.tsx
"use client";

import React, { useEffect, useState } from "react";
import SafeImage from "./SafeImage";
import { useAuth } from "@/lib/useAuth";
import { useUserStore } from "../store/useUserStore";
import { isAdmin } from "@/lib/rbac";
import { useAdminProductCategoriesStore } from "../store/useAdminProductCategoriesStore";
import { ProductCategoryItem, CreateProductCategoryRequest } from "../schemas/productCategorySchema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Loader2, Plus, Edit, Trash2, FolderTree, Tag, Upload, Image as ImageIcon, Sprout, ShoppingBag, Clock, ShieldAlert } from "lucide-react";
import { toast } from "./ui/toast";
import { uploadImageFile } from "../services/uploadService";
import { getErrorMessage } from "../lib/errors";

const EMPTY_FORM = {
  name: "",
  parent_id: "" as string | number,
  image_url: "",
  vertical: "paykop" as "paykop" | "farm",
  return_window_hours: 168,
  is_perishable: false,
};

// Helper to recursively flatten category tree nodes (handles both nested tree and flat array responses)
const flattenCategoriesTree = (
  items: ProductCategoryItem[],
  depth = 0,
  visited = new Set<number>()
): (ProductCategoryItem & { depth: number })[] => {
  let result: (ProductCategoryItem & { depth: number })[] = [];
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

export default function ProductCategoriesTab() {
  const { getToken } = useAuth();
  const backendUser = useUserStore((s) => s.backendUser);
  const canManage = isAdmin(backendUser?.role);
  const {
    categories,
    verticalFilter,
    setVerticalFilter,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useAdminProductCategoriesStore();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProductCategoryItem | null>(null);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const displayCategories = flattenCategoriesTree(categories);
  const filteredCategories =
    verticalFilter === "all"
      ? displayCategories
      : displayCategories.filter((c) => (c.vertical || "paykop") === verticalFilter);

  const rootCategories = displayCategories.filter((c) => !c.parent_id);

  useEffect(() => {
    fetchCategories(getToken, verticalFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getToken, verticalFilter]);

  const openCreate = (parentId?: number) => {
    setEditingItem(null);
    const parentCategory = parentId ? displayCategories.find((c) => c.id === parentId) : null;
    const inheritedVertical = (parentCategory?.vertical as "paykop" | "farm") || (verticalFilter !== "all" ? verticalFilter : "paykop");

    setFormData({
      ...EMPTY_FORM,
      parent_id: parentId ?? "",
      vertical: inheritedVertical,
      return_window_hours: parentCategory?.return_window_hours ?? (inheritedVertical === "farm" ? 24 : 168),
      is_perishable: parentCategory?.is_perishable ?? (inheritedVertical === "farm"),
    });
    setIsDialogOpen(true);
  };

  const openEdit = (item: ProductCategoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      parent_id: item.parent_id ?? "",
      image_url: item.image_url ?? "",
      vertical: (item.vertical as "paykop" | "farm") || "paykop",
      return_window_hours: item.return_window_hours ?? 168,
      is_perishable: item.is_perishable ?? false,
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
      const payload: CreateProductCategoryRequest = {
        name: formData.name,
        parent_id: formData.parent_id !== "" ? Number(formData.parent_id) : null,
        image_url: formData.image_url.trim() || null,
        vertical: formData.vertical,
        return_window_hours: Number(formData.return_window_hours) || 168,
        is_perishable: Boolean(formData.is_perishable),
      };
      if (editingItem) {
        await updateCategory(getToken, editingItem.id, payload);
        toast.success("Product category updated successfully!");
      } else {
        await createCategory(getToken, payload);
        toast.success("Product category created successfully!");
      }
      setIsDialogOpen(false);
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "");
      if (msg.includes("duplicate key") || msg.includes("23505") || msg.includes("already exists")) {
        toast.error("A category with this name already exists in this vertical. Please choose a unique name.", "Duplicate Category");
      } else {
        toast.error(msg || "Failed to save product category.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product category?")) return;
    setDeletingId(id);
    try {
      await deleteCategory(getToken, id);
      toast.success("Product category deleted successfully!");
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "");
      if (msg.includes("in use") || msg.includes("cannot be modified or deleted")) {
        toast.error(
          "Cannot delete category because it has linked products or subcategories. Please reassign or delete dependent products/subcategories first.",
          "Category In Use"
        );
      } else {
        toast.error(msg || "Failed to delete product category.");
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
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Product Categories</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage marketplace categories across Paykop retail and isolated Farm agricultural verticals.
          </p>
        </div>
        {canManage && (
          <Button
            onClick={() => openCreate()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 px-4 rounded-lg flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Category
          </Button>
        )}
      </div>

      {/* Vertical Filter Tabs */}
      <div className="flex gap-2 items-center flex-wrap">
        <span className="text-xs font-semibold text-slate-400 mr-1">Vertical Scope:</span>
        {(["all", "paykop", "farm"] as const).map((vert) => {
          const isActive = verticalFilter === vert;
          return (
            <button
              key={vert}
              onClick={() => setVerticalFilter(vert)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer capitalize ${
                isActive
                  ? vert === "farm"
                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 font-extrabold"
                    : "bg-blue-500/10 border border-blue-500/30 text-blue-600 font-extrabold"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600 border border-transparent"
              }`}
            >
              {vert === "farm" && <Sprout className="w-3.5 h-3.5 text-emerald-600" />}
              {vert === "paykop" && <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />}
              {vert === "all" ? "All Verticals" : vert === "paykop" ? "Paykop (Retail)" : "Farm (Produce)"}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading && filteredCategories.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-3">
            <FolderTree className="w-10 h-10 text-slate-300" />
            <p className="text-slate-800 font-bold text-sm">No product categories found</p>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              No categories found for vertical &quot;{verticalFilter}&quot;. Create root categories and subcategories with custom images.
            </p>
            <Button
              onClick={() => openCreate()}
              className="mt-1 bg-blue-600 hover:bg-blue-700 text-white font-bold h-8 px-4 rounded-lg flex items-center gap-2 text-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Create First Category
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="text-xs">
              <TableHeader className="bg-slate-50">
                <TableRow className="border-b border-slate-100 hover:bg-transparent">
                  <TableHead className="p-4 pl-6 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Category Name</TableHead>
                  <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Vertical</TableHead>
                  <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Parent Category</TableHead>
                  <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Perishable & Return Policy</TableHead>
                  <TableHead className="p-4 pr-6 text-right text-slate-400 font-bold uppercase tracking-wider text-[10px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {filteredCategories.map((cat) => {
                  const isFarm = cat.vertical === "farm";
                  return (
                    <TableRow key={cat.id} className="hover:bg-slate-50/50 transition border-b border-slate-100">
                      <TableCell className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          {cat.image_url ? (
                            <SafeImage
                              src={cat.image_url}
                              alt={cat.name}
                              width={36}
                              height={36}
                              className="w-9 h-9 rounded-lg object-cover border border-slate-200 shadow-sm shrink-0 bg-slate-50"
                            />
                          ) : (
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                              isFarm
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                : "bg-indigo-50 text-indigo-600 border-indigo-100"
                            }`}>
                              {isFarm ? <Sprout className="w-4 h-4" /> : <Tag className="w-4 h-4" />}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-800 text-[13px] flex items-center gap-1.5">
                              {cat.name}
                              {cat.parent_id ? (
                                <span className="text-[10px] font-normal text-slate-400">↳ sub</span>
                              ) : null}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">ID: {cat.id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            isFarm
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          {isFarm ? <Sprout className="w-3 h-3 text-emerald-600" /> : <ShoppingBag className="w-3 h-3 text-blue-600" />}
                          {isFarm ? "Farm" : "Paykop"}
                        </span>
                      </TableCell>
                      <TableCell className="p-4">
                        {cat.parent_id ? (
                          <span className="inline-flex px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 text-[10px] font-bold">
                            {getParentName(cat.parent_id)}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px] font-bold">Root Category</span>
                        )}
                      </TableCell>
                      <TableCell className="p-4">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5">
                            {cat.is_perishable ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                                <ShieldAlert className="w-3 h-3 text-amber-600" /> Perishable
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[10px]">Standard</span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" /> {cat.return_window_hours ?? 168}h return window
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="p-4 pr-6 text-right">
                        {deletingId === cat.id ? (
                          <Loader2 className="w-4 h-4 animate-spin inline-block text-blue-500" />
                        ) : canManage ? (
                          <div className="flex justify-end gap-2">
                            {!cat.parent_id && (
                              <Button
                                onClick={() => openCreate(cat.id)}
                                variant="outline"
                                className="h-7 px-2 rounded border border-indigo-200 hover:bg-indigo-50 text-indigo-600 text-[10px] inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" /> Subcategory
                              </Button>
                            )}
                            <Button
                              onClick={() => openEdit(cat)}
                              variant="outline"
                              className="h-7 px-2 rounded border border-blue-200 hover:bg-blue-50 text-blue-600 text-[10px] inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Edit className="w-3 h-3" /> Edit
                            </Button>
                            <Button
                              onClick={() => handleDelete(cat.id)}
                              variant="outline"
                              className="h-7 px-2 rounded border border-red-200 hover:bg-red-50 text-red-500 text-[10px] inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </Button>
                          </div>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-[480px] max-h-[85vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Product Category" : "Create Product Category"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4 text-sm">
              <div className="grid gap-1.5">
                <label className="text-xs font-bold text-slate-700">Category Name *</label>
                <input
                  required
                  maxLength={100}
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Fresh Vegetables, Grains, or Electronics"
                  className="w-full p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Vertical Selector */}
              <div className="grid gap-1.5">
                <label className="text-xs font-bold text-slate-700">Vertical Isolation Domain *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        vertical: "paykop",
                        return_window_hours: prev.return_window_hours || 168,
                        is_perishable: false,
                      }))
                    }
                    className={`p-2.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition ${
                      formData.vertical === "paykop"
                        ? "bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-500/20"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4 text-blue-600" /> Paykop Retail
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        vertical: "farm",
                        return_window_hours: prev.return_window_hours === 168 ? 24 : prev.return_window_hours,
                        is_perishable: true,
                      }))
                    }
                    className={`p-2.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition ${
                      formData.vertical === "farm"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500/20"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Sprout className="w-4 h-4 text-emerald-600" /> Farm Produce
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  {formData.vertical === "farm"
                    ? "Categories marked 'farm' are strictly isolated to the Paykop Farm ecosystem."
                    : "Standard retail categories scoped to the Paykop marketplace."}
                </p>
              </div>

              {/* Parent Category */}
              <div className="grid gap-1.5">
                <label className="text-xs font-bold text-slate-700">Parent Category (optional for subcategories)</label>
                <select
                  value={formData.parent_id}
                  onChange={(e) => setFormData((prev) => ({ ...prev, parent_id: e.target.value }))}
                  className="w-full p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                >
                  <option value="">None (Root category)</option>
                  {rootCategories
                    .filter((c) => (c.vertical || "paykop") === formData.vertical)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.vertical || "paykop"})
                      </option>
                    ))}
                </select>
              </div>

              {/* Return Policy & Perishability */}
              <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                <div className="grid gap-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> Return Window (hours)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={720}
                    value={formData.return_window_hours}
                    onChange={(e) => setFormData((prev) => ({ ...prev, return_window_hours: Number(e.target.value) }))}
                    className="w-full p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <span className="text-[10px] text-slate-400">Default: 168h (7 days). Fresh: 24h.</span>
                </div>

                <div className="flex flex-col justify-center gap-1.5 pt-2">
                  <label className="text-xs font-bold text-slate-700 cursor-pointer flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_perishable}
                      onChange={(e) => setFormData((prev) => ({ ...prev, is_perishable: e.target.checked }))}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    />
                    <span>Perishable Produce</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Applies strict return window rules</span>
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
                    <SafeImage
                      src={formData.image_url}
                      alt="Category Preview"
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200 shadow-sm shrink-0 bg-white"
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
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-lg h-9 cursor-pointer">
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-9 cursor-pointer"
                disabled={saving || uploadingImage}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingItem ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
