// src/components/ProductsTab.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/useAuth";
import { useUserStore } from "../store/useUserStore";
import { isAdmin } from "@/lib/rbac";
import { useAdminProductsStore } from "../store/useAdminProductsStore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { Check, X, Package, Loader2, Trash2, Sprout, ShoppingBag, Clock, Leaf } from "lucide-react";
import { toast } from "./ui/toast";
import { getErrorMessage } from "../lib/errors";

const PRODUCT_STATUSES = ["pending", "approved", "rejected"] as const;

export default function ProductsTab() {
  const { getToken } = useAuth();
  const backendUser = useUserStore((s) => s.backendUser);
  const canDelete = isAdmin(backendUser?.role);
  const [filterStatus, setFilterStatus] = useState<string>("approved");
  const {
    products,
    verticalFilter,
    setVerticalFilter,
    loading,
    fetchProducts,
    updateProductStatus,
    deleteProductAction,
  } = useAdminProductsStore();
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    fetchProducts(getToken, filterStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getToken, filterStatus]);

  const filteredProducts =
    verticalFilter === "all"
      ? products
      : products.filter((p) => (p.vertical || "paykop") === verticalFilter);

  const handleUpdateStatus = async (id: number, status: string) => {
    setProcessingId(id);
    try {
      await updateProductStatus(getToken, id, status);
      toast.success(`Product marked ${status}`);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to update product status"));
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
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to delete product"));
    } finally {
      setProcessingId(null);
    }
  };

  const formatStock = (p: typeof products[0]) => {
    if (p.vertical === "farm") {
      if (p.stock_milli && p.stock_milli > 0) {
        return `${(p.stock_milli / 1000).toLocaleString()} ${p.unit || "kg"}`;
      }
      return `${p.stock} ${p.unit || "kg"}`;
    }
    return `${p.stock} ${p.unit || "units"}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Catalog moderation — products</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          New seller listings go live immediately. Oversee retail inventory and isolated fresh farm produce.
        </p>
      </div>

      {/* Filter Row: Status & Vertical */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between flex-wrap">
        {/* Status Pills */}
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-xs font-semibold text-slate-400 mr-1">Status:</span>
          {PRODUCT_STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer capitalize ${
                filterStatus === status
                  ? "bg-blue-500/10 border border-blue-500/20 text-blue-600 font-extrabold"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600 border border-transparent"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Vertical Scope Pills */}
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-xs font-semibold text-slate-400 mr-1">Vertical:</span>
          {(["all", "paykop", "farm"] as const).map((vert) => {
            const isActive = verticalFilter === vert;
            return (
              <button
                key={vert}
                onClick={() => setVerticalFilter(vert)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer capitalize ${
                  isActive
                    ? vert === "farm"
                      ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 font-extrabold"
                      : "bg-blue-500/10 border border-blue-500/30 text-blue-600 font-extrabold"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600 border border-transparent"
                }`}
              >
                {vert === "farm" && <Sprout className="w-3.5 h-3.5 text-emerald-600" />}
                {vert === "paykop" && <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />}
                {vert === "all" ? "All" : vert === "paykop" ? "Paykop" : "Farm"}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading && filteredProducts.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center justify-center gap-2">
            <Package className="w-10 h-10 text-slate-300" />
            <p className="text-slate-800 font-bold text-sm">No products found</p>
            <p className="text-xs text-slate-400">
              There are no products with status &quot;{filterStatus}&quot; in vertical &quot;{verticalFilter}&quot;.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="text-xs">
              <TableHeader className="bg-slate-50">
                <TableRow className="border-b border-slate-100 hover:bg-transparent">
                  <TableHead className="p-4 pl-6 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Product</TableHead>
                  <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Vertical</TableHead>
                  <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Category & Details</TableHead>
                  <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Price & Stock</TableHead>
                  <TableHead className="p-4 pr-6 text-right text-slate-400 font-bold uppercase tracking-wider text-[10px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => {
                  const isFarm = p.vertical === "farm";
                  return (
                    <TableRow key={p.id} className="hover:bg-slate-50/50 transition border-b border-slate-100">
                      <TableCell className="p-4 pl-6 font-bold text-slate-800">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                              isFarm
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                : "bg-blue-50 text-blue-600 border-blue-100"
                            }`}
                          >
                            {isFarm ? <Sprout className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="truncate max-w-[240px] text-slate-800 font-bold text-[13px]">
                              {p.title || "Untitled Product"}
                            </div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              ID: {p.id} · Seller: {p.seller_id.slice(0, 10)}...
                            </div>
                            {isFarm && p.farm_name && (
                              <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                                <Leaf className="w-2.5 h-2.5" /> {p.farm_name}
                              </div>
                            )}
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
                          {isFarm ? "Farm Produce" : "Paykop"}
                        </span>
                      </TableCell>

                      <TableCell className="p-4">
                        <div className="text-slate-700 font-semibold">{p.category || "General"}</div>
                        {isFarm ? (
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                            <span className="capitalize">{p.farming_method || "natural"}</span>
                            <span>·</span>
                            <span className="flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5" /> {p.shelf_life_days ?? 7}d shelf life
                            </span>
                            {p.is_tax_exempt && (
                              <>
                                <span>·</span>
                                <span className="text-emerald-600 font-bold">0% GST</span>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {p.gst_rate_bps ? `${(p.gst_rate_bps / 100).toFixed(0)}% GST` : "18% GST"}
                            {p.hsn_code ? ` · HSN: ${p.hsn_code}` : ""}
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="p-4">
                        <div className="text-slate-800 font-bold">₹{(p.price / 100).toFixed(2)}</div>
                        <div className="text-slate-500 font-medium text-[11px]">{formatStock(p)}</div>
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
                                <Check className="w-3 h-3" /> Restore live
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
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
