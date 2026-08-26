// src/components/ServicesTab.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/useAuth";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Check, X, ShieldAlert, Loader2, Trash2, Eye, MapPin, DollarSign, Calendar, User } from "lucide-react";
import { fetchAdminServices, updateAdminServiceStatus } from "../services/serviceService";
import { ServiceItem } from "../schemas/serviceSchema";

export default function ServicesTab() {
  const { getToken } = useAuth();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("pending");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [processingId, setProcessingId] = useState<number | string | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  const loadServices = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const data = await fetchAdminServices(token || undefined, page, limit, filterStatus || undefined);
      setServices(data.services || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Failed to load services:", err);
    } finally {
      setLoading(false);
    }
  }, [getToken, page, limit, filterStatus]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  // Reset page when status filter changes
  const handleFilterChange = (status: string) => {
    setFilterStatus(status);
    setPage(1);
  };

  const handleUpdateStatus = async (id: number | string, status: string) => {
    setProcessingId(id);
    try {
      const token = await getToken();
      await updateAdminServiceStatus(token || undefined, id, status);
      setSelectedService(null);
      loadServices();
    } catch (err) {
      console.error("Failed to update service status:", err);
      alert("Error updating service status");
    } finally {
      setProcessingId(null);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Service Listings Moderation</h2>
        <p className="text-sm text-slate-500 mt-0.5">Approve, reject, or remove professional service listings submitted by providers.</p>
      </div>

      {/* Tabs Row */}
      <div className="flex gap-2 flex-wrap">
        {["pending", "approved", "rejected", "removed"].map((status) => (
          <button
            key={status}
            onClick={() => handleFilterChange(status)}
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

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading && services.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : services.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center justify-center gap-2">
            <ShieldAlert className="w-10 h-10 text-slate-300" />
            <p className="text-slate-800 font-bold text-sm">No services found</p>
            <p className="text-xs text-slate-400">There are no service listings with the status &quot;{filterStatus}&quot;.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="text-xs">
              <TableHeader className="bg-slate-50">
                <TableRow className="border-b border-slate-100 hover:bg-transparent">
                  <TableHead className="p-4 pl-6 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Service Listing</TableHead>
                  <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Category</TableHead>
                  <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Provider</TableHead>
                  <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Fees</TableHead>
                  <TableHead className="p-4 pr-6 text-right text-slate-400 font-bold uppercase tracking-wider text-[10px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {services.map((s) => (
                  <TableRow key={s.id} className="hover:bg-slate-50/50 transition border-b border-slate-100">
                    <TableCell className="p-4 pl-6 font-bold text-slate-800">
                      <div>
                        <div className="truncate max-w-[250px]">{s.title || "Untitled Service"}</div>
                        <div className="text-[10px] text-slate-400 font-normal truncate max-w-[250px]">{s.address}</div>
                      </div>
                    </TableCell>
                    <TableCell className="p-4 text-slate-500 font-semibold">{s.category_name || "General"}</TableCell>
                    <TableCell className="p-4 text-slate-500 font-mono text-[11px] truncate max-w-[120px]" title={s.provider_id}>
                      {s.provider_id}
                    </TableCell>
                    <TableCell className="p-4">
                      <div className="text-slate-800 font-bold">₹{(s.fees / 100).toFixed(2)}</div>
                    </TableCell>
                    <TableCell className="p-4 pr-6 text-right space-x-2 whitespace-nowrap">
                      {processingId === s.id ? (
                        <Loader2 className="w-4 h-4 animate-spin inline-block text-blue-500" />
                      ) : (
                        <div className="flex justify-end gap-2">
                          <Button
                            onClick={() => setSelectedService(s)}
                            variant="outline"
                            className="h-7 px-2 rounded border border-slate-200 hover:bg-slate-50 text-slate-600 text-[10px] inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3 h-3" /> View Details
                          </Button>

                          {filterStatus !== "approved" && (
                            <Button
                              onClick={() => handleUpdateStatus(s.id, "approved")}
                              variant="outline"
                              className="h-7 px-2 rounded border border-emerald-200 hover:bg-emerald-50 text-emerald-600 text-[10px] inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3 h-3" /> Approve
                            </Button>
                          )}
                          {filterStatus !== "rejected" && (
                            <Button
                              onClick={() => handleUpdateStatus(s.id, "rejected")}
                              variant="outline"
                              className="h-7 px-2 rounded border border-rose-200 hover:bg-rose-50 text-rose-600 text-[10px] inline-flex items-center gap-1 cursor-pointer"
                            >
                              <X className="w-3 h-3" /> Reject
                            </Button>
                          )}
                          {filterStatus !== "removed" && (
                            <Button
                              onClick={() => handleUpdateStatus(s.id, "removed")}
                              variant="outline"
                              className="h-7 px-2 rounded border border-slate-200 hover:bg-slate-50 text-slate-600 text-[10px] inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" /> Remove
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

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex flex-wrap justify-between items-center gap-3 bg-white border border-slate-200 px-4 md:px-6 py-3.5 rounded-2xl shadow-sm text-xs">
          <span className="text-slate-500 font-semibold">
            Showing Page {page} of {totalPages} ({total} total items)
          </span>
          <div className="flex gap-2">
            <Button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              variant="outline"
              className="h-8 px-3 rounded-lg border-slate-200 hover:bg-slate-50 cursor-pointer disabled:opacity-50"
            >
              Previous
            </Button>
            <Button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              variant="outline"
              className="h-8 px-3 rounded-lg border-slate-200 hover:bg-slate-50 cursor-pointer disabled:opacity-50"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Details View Dialog */}
      <Dialog open={!!selectedService} onOpenChange={() => setSelectedService(null)}>
        <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-2xl max-h-[85vh] overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-left text-slate-800">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              Service Listing Details
            </DialogTitle>
          </DialogHeader>

          {selectedService && (
            <div className="mt-4 space-y-5 text-xs">
              {/* Service Title */}
              <div>
                <h4 className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Service Title</h4>
                <p className="text-base font-extrabold text-slate-900 mt-1">{selectedService.title}</p>
              </div>

              {/* Grid properties */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <User className="w-3.5 h-3.5" /> Provider ID
                  </h4>
                  <p className="font-mono text-slate-700 mt-1 truncate" title={selectedService.provider_id}>
                    {selectedService.provider_id}
                  </p>
                </div>
                <div>
                  <h4 className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" /> Service Category
                  </h4>
                  <p className="font-semibold text-slate-700 mt-1">{selectedService.category_name}</p>
                </div>
                <div>
                  <h4 className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" /> Listing Fees
                  </h4>
                  <p className="font-bold text-slate-900 mt-1 text-sm">₹{(selectedService.fees / 100).toFixed(2)}</p>
                </div>
                <div>
                  <h4 className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Submitted At
                  </h4>
                  <p className="text-slate-700 mt-1">
                    {new Date(selectedService.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Description</h4>
                <p className="text-slate-700 bg-slate-50 border border-slate-100 rounded-xl p-3.5 mt-1 leading-relaxed max-h-36 overflow-y-auto whitespace-pre-wrap">
                  {selectedService.description || "No description provided."}
                </p>
              </div>

              {/* Address */}
              <div>
                <h4 className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> Address
                </h4>
                <p className="text-slate-700 mt-1">{selectedService.address}</p>
              </div>

              {/* Moderation actions inside dialog */}
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-6">
                {processingId === selectedService.id ? (
                  <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                ) : (
                  <>
                    {selectedService.status !== "approved" && (
                      <Button
                        onClick={() => handleUpdateStatus(selectedService.id, "approved")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 px-4 rounded-xl text-xs flex items-center gap-1 shadow-sm shadow-emerald-500/10 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve Listing
                      </Button>
                    )}
                    {selectedService.status !== "rejected" && (
                      <Button
                        onClick={() => handleUpdateStatus(selectedService.id, "rejected")}
                        className="bg-rose-600 hover:bg-rose-700 text-white font-bold h-9 px-4 rounded-xl text-xs flex items-center gap-1 shadow-sm shadow-rose-500/10 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </Button>
                    )}
                    {selectedService.status !== "removed" && (
                      <Button
                        onClick={() => handleUpdateStatus(selectedService.id, "removed")}
                        className="bg-slate-700 hover:bg-slate-800 text-white font-bold h-9 px-4 rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </Button>
                    )}
                    <Button
                      onClick={() => setSelectedService(null)}
                      variant="outline"
                      className="border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold h-9 px-4 rounded-xl text-xs cursor-pointer"
                    >
                      Close
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
