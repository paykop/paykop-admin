"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { useAdminOrgStore } from "../store/useAdminOrgStore";
import { Organization } from "../schemas/organizationSchema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import {
  Loader2,
  Eye,
  Check,
  X,
  Building2,
  FileText,
  Plus,
  CreditCard,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "./ui/toast";
import { safeExternalUrl } from "@/lib/safeExternalUrl";
import { getErrorMessage } from "../lib/errors";
import RoleAccessBanner from "./RoleAccessBanner";

const STATUS_FILTERS = ["all", "submitted", "verified", "rejected", "draft"] as const;

type OrgType = "ngo" | "trust" | "section8_company" | "individual_fundraiser";
type OrgCategory = "education" | "health" | "animal_welfare" | "disaster_relief" | "religious" | "other";

export default function OrganizationsTab() {
  const { getToken } = useAuth();
  const {
    organizations,
    loading,
    statusFilter,
    setStatusFilter,
    fetchOrganizations,
    selected,
    detailsLoading,
    fetchDetail,
    createOrg,
    approveKYC,
    rejectKYC,
    clearSelected,
    error,
  } = useAdminOrgStore();

  const [viewOpen, setViewOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);

  // New Organization Form State
  const [formLegalName, setFormLegalName] = useState("");
  const [formOrgType, setFormOrgType] = useState<OrgType>("ngo");
  const [formCategory, setFormCategory] = useState<OrgCategory>("education");
  const [formRegNo, setFormRegNo] = useState("");
  const [formPAN, setFormPAN] = useState("");
  const [formIs80G, setFormIs80G] = useState(false);
  const [formRegDocURL, setFormRegDocURL] = useState("");
  const [form80GCertURL, setForm80GCertURL] = useState("");
  const [form12ACertURL, setForm12ACertURL] = useState("");
  const [formSignatoryName, setFormSignatoryName] = useState("");
  const [formSignatoryIDURL, setFormSignatoryIDURL] = useState("");
  const [formAccountHolder, setFormAccountHolder] = useState("");
  const [formAccountNumber, setFormAccountNumber] = useState("");
  const [formIFSC, setFormIFSC] = useState("");
  const [formBankName, setFormBankName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchOrganizations(getToken, 1, 20, statusFilter);
  }, [getToken, statusFilter, fetchOrganizations]);

  const handleOpen = async (id: string) => {
    setViewOpen(true);
    await fetchDetail(getToken, id);
  };

  const handleApprove = async (id: string) => {
    if (!confirm("Are you sure you want to approve this organization's KYC?")) return;
    setProcessingId(id);
    try {
      await approveKYC(getToken, id);
      toast.success("Organization KYC approved successfully.");
      setViewOpen(false);
      clearSelected();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to approve KYC."));
    } finally {
      setProcessingId(null);
    }
  };

  const openReject = (id: string) => {
    setRejectTargetId(id);
    setRejectReason("");
    setRejectOpen(true);
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectTargetId || !rejectReason.trim()) return;
    setProcessingId(rejectTargetId);
    try {
      await rejectKYC(getToken, rejectTargetId, rejectReason.trim());
      toast.success("Organization KYC rejected.");
      setRejectOpen(false);
      setViewOpen(false);
      clearSelected();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to reject KYC."));
    } finally {
      setProcessingId(null);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formLegalName.trim()) {
      toast.error("Legal name is required");
      return;
    }
    setSubmitting(true);
    try {
      await createOrg(getToken, {
        legal_name: formLegalName.trim(),
        org_type: formOrgType,
        category: formCategory,
        registration_number: formRegNo.trim() || undefined,
        pan: formPAN.trim().toUpperCase() || undefined,
        is_80g_registered: formIs80G,
        registration_doc_url: formRegDocURL.trim() || undefined,
        cert_80g_url: form80GCertURL.trim() || undefined,
        cert_12a_url: form12ACertURL.trim() || undefined,
        authorized_signatory_name: formSignatoryName.trim() || undefined,
        authorized_signatory_id_url: formSignatoryIDURL.trim() || undefined,
        description: formDescription.trim() || undefined,
        payout_destination:
          formAccountNumber.trim() && formIFSC.trim() && formAccountHolder.trim()
            ? {
                account_number: formAccountNumber.trim(),
                ifsc: formIFSC.trim().toUpperCase(),
                account_holder_name: formAccountHolder.trim(),
                bank_name: formBankName.trim() || undefined,
              }
            : undefined,
      });
      toast.success("Organization created successfully.");
      setCreateOpen(false);
      resetForm();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to create organization."));
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormLegalName("");
    setFormOrgType("ngo");
    setFormCategory("education");
    setFormRegNo("");
    setFormPAN("");
    setFormIs80G(false);
    setFormRegDocURL("");
    setForm80GCertURL("");
    setForm12ACertURL("");
    setFormSignatoryName("");
    setFormSignatoryIDURL("");
    setFormAccountHolder("");
    setFormAccountNumber("");
    setFormIFSC("");
    setFormBankName("");
    setFormDescription("");
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      submitted: "bg-amber-50 text-amber-700 border-amber-200",
      verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
      rejected: "bg-rose-50 text-rose-600 border-rose-200",
      draft: "bg-slate-100 text-slate-600 border-slate-200",
    };
    return map[status] || "bg-slate-100 text-slate-600 border-slate-200";
  };

  const formatDate = (isoStr?: string | null) => {
    if (!isoStr) return "—";
    try {
      return new Date(isoStr).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="space-y-6">
      <RoleAccessBanner />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Organizations & KYC</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Review and verify NGOs, charitable trusts, and Section 8 companies before approving donation payouts.
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setCreateOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" /> New Organization
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition capitalize cursor-pointer ${
              statusFilter === status
                ? "bg-blue-500/10 border border-blue-500/20 text-blue-600"
                : "bg-slate-100 hover:bg-slate-200 text-slate-600"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>
      )}

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading && organizations.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : organizations.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-2">
            <Building2 className="w-12 h-12 text-slate-300" />
            <p className="text-slate-800 font-bold text-sm">No organizations found</p>
            <p className="text-slate-500 text-xs max-w-sm">
              No organizations match the current filter. Create a new organization or change the filter tab.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="text-xs">
              <TableHeader className="bg-slate-50">
                <TableRow className="border-b border-slate-100 hover:bg-transparent">
                  <TableHead className="p-4 pl-6 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    Organization
                  </TableHead>
                  <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    Type & Category
                  </TableHead>
                  <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    Tax & 80G
                  </TableHead>
                  <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    KYC Status
                  </TableHead>
                  <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    Created
                  </TableHead>
                  <TableHead className="p-4 pr-6 text-right text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {organizations.map((org: Organization) => (
                  <TableRow key={org.id} className="hover:bg-slate-50/50 border-b border-slate-100">
                    <TableCell className="p-4 pl-6">
                      <div className="font-semibold text-slate-800">{org.legal_name}</div>
                      <div className="font-mono text-[10px] text-slate-400 mt-0.5">{org.id}</div>
                    </TableCell>
                    <TableCell className="p-4 text-slate-600 capitalize">
                      <div className="font-medium text-slate-700">{org.org_type.replace(/_/g, " ")}</div>
                      <div className="text-[10px] text-slate-400">{org.category.replace(/_/g, " ")}</div>
                    </TableCell>
                    <TableCell className="p-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {org.is_80g_registered ? (
                          <span className="inline-flex px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                            80G Registered
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Standard</span>
                        )}
                        {org.pan && <span className="font-mono text-[10px] text-slate-600">PAN: {org.pan}</span>}
                      </div>
                    </TableCell>
                    <TableCell className="p-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-bold capitalize ${statusBadge(
                          org.kyc_status
                        )}`}
                      >
                        {org.kyc_status}
                      </span>
                    </TableCell>
                    <TableCell className="p-4 text-slate-500">{formatDate(org.created_at)}</TableCell>
                    <TableCell className="p-4 pr-6 text-right">
                      {processingId === org.id ? (
                        <Loader2 className="w-4 h-4 animate-spin inline-block text-blue-500" />
                      ) : (
                        <div className="flex justify-end gap-2 flex-wrap items-center">
                          <Button
                            onClick={() => handleOpen(org.id)}
                            variant="outline"
                            className="h-7 px-2 rounded border border-slate-200 text-slate-600 text-[10px] cursor-pointer"
                          >
                            <Eye className="w-3 h-3 mr-1" /> Review
                          </Button>
                          {org.kyc_status === "submitted" && (
                            <>
                              <Button
                                onClick={() => handleApprove(org.id)}
                                variant="outline"
                                className="h-7 px-2 rounded border border-emerald-200 text-emerald-600 text-[10px] cursor-pointer"
                              >
                                <Check className="w-3 h-3 mr-1" /> Approve
                              </Button>
                              <Button
                                onClick={() => openReject(org.id)}
                                variant="outline"
                                className="h-7 px-2 rounded border border-rose-200 text-rose-600 text-[10px] cursor-pointer"
                              >
                                <X className="w-3 h-3 mr-1" /> Reject
                              </Button>
                            </>
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

      {/* Review / Detail Dialog */}
      <Dialog
        open={viewOpen}
        onOpenChange={(open) => {
          setViewOpen(open);
          if (!open) clearSelected();
        }}
      >
        <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-2xl max-h-[85vh] overflow-y-auto bg-white border border-slate-200 rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" /> Organization KYC Review
            </DialogTitle>
          </DialogHeader>
          {detailsLoading || !selected ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="space-y-5 text-xs pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Legal Name</p>
                  <p className="font-semibold text-slate-800 mt-0.5 text-sm">{selected.legal_name}</p>
                  <p className="font-mono text-[10px] text-slate-400 mt-0.5">{selected.id}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">KYC Status</p>
                  <span
                    className={`inline-flex mt-1 px-2.5 py-0.5 rounded-full border text-[10px] font-bold capitalize ${statusBadge(
                      selected.kyc_status
                    )}`}
                  >
                    {selected.kyc_status}
                  </span>
                  {selected.verified_at && (
                    <p className="text-[10px] text-slate-500 mt-1">
                      Verified at: {formatDate(selected.verified_at)}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Organization Type</p>
                  <p className="font-medium text-slate-700 capitalize mt-0.5">
                    {selected.org_type.replace(/_/g, " ")}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Category</p>
                  <p className="font-medium text-slate-700 capitalize mt-0.5">
                    {selected.category.replace(/_/g, " ")}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Registration / License No.</p>
                  <p className="font-mono mt-0.5 text-slate-700">{selected.registration_number || "—"}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">PAN</p>
                  <p className="font-mono mt-0.5 text-slate-700">{selected.pan || "—"}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Section 80G Exemption</p>
                  <p className="font-semibold mt-0.5 text-slate-700">
                    {selected.is_80g_registered ? "Yes (Tax Exempt)" : "No"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">Authorized Signatory</p>
                  <p className="mt-0.5 text-slate-700">{selected.authorized_signatory_name || "—"}</p>
                </div>
              </div>

              {/* Payout Destination */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1 mb-2">
                  <CreditCard className="w-3.5 h-3.5 text-slate-500" /> Masked Bank Payout Destination
                </p>
                {selected.masked_payout_destination ? (
                  <p className="font-mono text-xs text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200">
                    {selected.masked_payout_destination}
                  </p>
                ) : (
                  <p className="text-slate-400 text-xs">No bank account registered yet.</p>
                )}
              </div>

              {/* Rejection notice if present */}
              {selected.rejection_reason && (
                <div className="rounded-lg bg-rose-50 border border-rose-100 p-3 text-rose-700">
                  <p className="font-bold text-[10px] uppercase mb-1">Rejection Reason</p>
                  {selected.rejection_reason}
                </div>
              )}

              {/* Documents */}
              <div>
                <p className="text-slate-400 font-bold uppercase text-[10px] mb-2">Submitted Verification Documents</p>
                <div className="space-y-2">
                  {[
                    { label: "Registration Certificate", url: selected.registration_doc_url },
                    { label: "80G Certificate", url: selected.cert_80g_url },
                    { label: "12A Certificate", url: selected.cert_12a_url },
                    { label: "Authorized Signatory ID", url: selected.authorized_signatory_id_url },
                  ]
                    .filter((d) => Boolean(d.url))
                    .map((doc, idx) => {
                      const safeHref = safeExternalUrl(doc.url);
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                            <span className="font-semibold text-slate-700">{doc.label}</span>
                          </div>
                          {safeHref ? (
                            <a
                              href={safeHref}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:text-blue-800 font-semibold text-xs inline-flex items-center gap-1"
                            >
                              Open Document &rarr;
                            </a>
                          ) : (
                            <span className="text-slate-400 text-[10px]">Unsafe URL</span>
                          )}
                        </div>
                      );
                    })}
                  {!selected.registration_doc_url &&
                    !selected.cert_80g_url &&
                    !selected.cert_12a_url &&
                    !selected.authorized_signatory_id_url && (
                      <p className="text-slate-400">No documents uploaded.</p>
                    )}
                </div>
              </div>

              {/* Action Buttons inside modal */}
              {selected.kyc_status === "submitted" && (
                <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                  <Button
                    onClick={() => openReject(selected.id)}
                    variant="outline"
                    className="border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" /> Reject KYC
                  </Button>
                  <Button
                    onClick={() => handleApprove(selected.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve & Verify
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-md bg-white border border-slate-200 rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-rose-600">Reject Organization KYC</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleReject} className="space-y-4 pt-2 text-xs">
            <p className="text-slate-600">
              Please specify the compliance reason for rejection. This reason will be logged and communicated to the organization contact.
            </p>
            <div>
              <label className="block font-bold text-[10px] uppercase text-slate-500 mb-1">
                Rejection Reason (Required)
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. 80G Certificate expired, registration document illegible..."
                rows={3}
                required
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
            <DialogFooter className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setRejectOpen(false)}
                className="text-xs rounded-lg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!rejectReason.trim() || processingId !== null}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg"
              >
                Confirm Rejection
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Organization Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-2xl max-h-[85vh] overflow-y-auto bg-white border border-slate-200 rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" /> Register New Organization
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-bold text-[10px] uppercase text-slate-500 mb-1">
                  Legal Organization Name *
                </label>
                <input
                  type="text"
                  required
                  value={formLegalName}
                  onChange={(e) => setFormLegalName(e.target.value)}
                  placeholder="e.g. Smile Foundation India"
                  className="w-full p-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[10px] uppercase text-slate-500 mb-1">
                  Entity Type *
                </label>
                <select
                  value={formOrgType}
                  onChange={(e) => setFormOrgType(e.target.value as OrgType)}
                  className="w-full p-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none capitalize"
                >
                  <option value="ngo">NGO</option>
                  <option value="trust">Charitable Trust</option>
                  <option value="section8_company">Section 8 Company</option>
                  <option value="individual_fundraiser">Individual Fundraiser</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[10px] uppercase text-slate-500 mb-1">
                  Category *
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as OrgCategory)}
                  className="w-full p-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none capitalize"
                >
                  <option value="education">Education</option>
                  <option value="health">Health</option>
                  <option value="animal_welfare">Animal Welfare</option>
                  <option value="disaster_relief">Disaster Relief</option>
                  <option value="religious">Religious</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[10px] uppercase text-slate-500 mb-1">
                  Registration / Trust No.
                </label>
                <input
                  type="text"
                  value={formRegNo}
                  onChange={(e) => setFormRegNo(e.target.value)}
                  placeholder="e.g. TR-2024-8849"
                  className="w-full p-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[10px] uppercase text-slate-500 mb-1">
                  Organization PAN
                </label>
                <input
                  type="text"
                  value={formPAN}
                  onChange={(e) => setFormPAN(e.target.value)}
                  placeholder="e.g. AABCS1234F"
                  maxLength={10}
                  className="w-full p-2 rounded-lg border border-slate-200 text-xs uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-blue-50/60 rounded-xl border border-blue-100">
              <input
                type="checkbox"
                id="is80g"
                checked={formIs80G}
                onChange={(e) => setFormIs80G(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="is80g" className="text-slate-700 font-semibold cursor-pointer">
                Registered under Section 80G (Tax Deductible Receipts Eligible)
              </label>
            </div>

            {/* Document URLs */}
            <div className="space-y-2">
              <p className="font-bold text-[10px] uppercase text-slate-400">Document Cloud Storage URLs</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="url"
                  value={formRegDocURL}
                  onChange={(e) => setFormRegDocURL(e.target.value)}
                  placeholder="Registration Certificate Document URL"
                  className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                />
                <input
                  type="url"
                  value={form80GCertURL}
                  onChange={(e) => setForm80GCertURL(e.target.value)}
                  placeholder="80G Certificate URL"
                  className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                />
                <input
                  type="url"
                  value={form12ACertURL}
                  onChange={(e) => setForm12ACertURL(e.target.value)}
                  placeholder="12A Certificate URL"
                  className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                />
                <input
                  type="url"
                  value={formSignatoryIDURL}
                  onChange={(e) => setFormSignatoryIDURL(e.target.value)}
                  placeholder="Authorized Signatory ID URL"
                  className="w-full p-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>
            </div>

            {/* Bank Details (Encrypted at rest on backend) */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <p className="font-bold text-[10px] uppercase text-slate-500 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-blue-600" /> Payout Bank Details (Encrypted via AES-256-GCM)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={formAccountHolder}
                  onChange={(e) => setFormAccountHolder(e.target.value)}
                  placeholder="Account Holder Name"
                  className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-white"
                />
                <input
                  type="text"
                  value={formAccountNumber}
                  onChange={(e) => setFormAccountNumber(e.target.value)}
                  placeholder="Account Number"
                  className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-white"
                />
                <input
                  type="text"
                  value={formIFSC}
                  onChange={(e) => setFormIFSC(e.target.value)}
                  placeholder="IFSC Code (e.g. HDFC0001234)"
                  className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-white uppercase"
                />
                <input
                  type="text"
                  value={formBankName}
                  onChange={(e) => setFormBankName(e.target.value)}
                  placeholder="Bank Name (e.g. HDFC Bank)"
                  className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-white"
                />
              </div>
            </div>

            <DialogFooter className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
                className="text-xs rounded-lg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Organization"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
