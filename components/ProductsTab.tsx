"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/useAuth";
import { useUserStore } from "../store/useUserStore";
import { isAdmin } from "@/lib/rbac";
import { useAdminProductsStore } from "../store/useAdminProductsStore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { Check, X, Package, Loader2, Trash2 } from "lucide-react";
import { toast } from "./ui/toast";

const PRODUCT_STATUSES = ["pending", "approved", "rejected", "removed"] as const;

export default function ProductsTab() {
  const { getToken } = useAuth();
  const backendUser = useUserStore((s) => s.backendUser);
  const canDelete = isAdmin(backendUser?.role);
  const [filterStatus, setFilterStatus] = useState<string>("pending");
  const { products, loading, fetchProducts, updateProductStatus, deleteProductAction } = useAdminProductsStore();
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    fetchProducts(getToken, filterStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getToken, filterStatus]);

  const handleUpdateStatus = async (id: number, status: string) => {
    setProcessingId(id);
    try {
      await updateProductStatus(getToken, id, status);
      toast.success(`Product marked ${status}`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update product status");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!canDelete) return;
    if (!confirm("Are you sure you want to delete this product?")) return;
    setProcessingId(id);
    try {
      await deleteProductAction(getToken, id);
      toast.success("Product deleted");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete product");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Products Management</h2>
        <p className="text-sm text-slate-500 mt-0.5">Moderate marketplace products and update their visibility.</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {PRODUCT_STATUSES.map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer capitalize ${
              filterStatus === status
                ? "bg-blue-500/10 border border-blue-500/20 text-blue-600"
                : "bg-slate-100 hover:bg-slate-200 text-slate-600"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading && products.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : products.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center justify-center gap-2">
            <Package className="w-10 h-10 text-slate-300" />
            <p className="text-slate-800 font-bold text-sm">No products found</p>
            <p className="text-xs text-slate-400">There are no products with the status &quot;{filterStatus}&quot;.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="text-xs">
              <TableHeader className="bg-slate-50">
                <TableRow className="border-b border-slate-100 hover:bg-transparent">
                  <TableHead className="p-4 pl-6 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Product</TableHead>
                  <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Category</TableHead>
                  <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Price & Stock</TableHead>
                  <TableHead className="p-4 pr-6 text-right text-slate-400 font-bold uppercase tracking-wider text-[10px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <TableRow key={p.id} className="hover:bg-slate-50/50 transition border-b border-slate-100">
                    <TableCell className="p-4 pl-6 font-bold text-slate-800 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="truncate max-w-[250px]">{p.title || "Untitled Product"}</div>
                        <div className="text-[10px] text-slate-400 font-normal">ID: {p.id}</div>
                      </div>
                    </TableCell>
                    <TableCell className="p-4 text-slate-500 font-semibold">{p.category || "General"}</TableCell>
                    <TableCell className="p-4">
                      <div className="text-slate-800 font-bold">₹{(p.price / 100).toFixed(2)}</div>
                      <div className="text-slate-400 font-semibold">{p.stock} units</div>
                    </TableCell>
                    <TableCell className="p-4 pr-6 text-right space-x-2 whitespace-nowrap">
                      {processingId === p.id ? (
                        <Loader2 className="w-4 h-4 animate-spin inline-block text-blue-500" />
                      ) : (
                        <div className="flex justify-end gap-2">
                          {filterStatus !== "approved" && (
                            <Button
                              onClick={() => handleUpdateStatus(p.id, "approved")}
                              variant="outline"
                              className="h-7 px-2 rounded border border-emerald-200 hover:bg-emerald-50 text-emerald-600 text-[10px] inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3 h-3" /> Approve
                            </Button>
                          )}
                          {filterStatus !== "rejected" && (
                            <Button
                              onClick={() => handleUpdateStatus(p.id, "rejected")}
                              variant="outline"
                              className="h-7 px-2 rounded border border-amber-200 hover:bg-amber-50 text-amber-600 text-[10px] inline-flex items-center gap-1 cursor-pointer"
                            >
                              <X className="w-3 h-3" /> Reject
                            </Button>
                          )}
                          {filterStatus !== "removed" && (
                            <Button
                              onClick={() => handleUpdateStatus(p.id, "removed")}
                              variant="outline"
                              className="h-7 px-2 rounded border border-slate-200 hover:bg-slate-50 text-slate-600 text-[10px] inline-flex items-center gap-1 cursor-pointer"
                            >
                              Remove
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              onClick={() => handleDelete(p.id)}
                              variant="outline"
                              className="h-7 px-2 rounded border border-red-200 hover:bg-red-50 text-red-500 text-[10px] inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </Button>
                          )}
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
    </div>
  );
}
