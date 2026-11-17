import { apiRequest } from "./apiService";
import {
  donationLedgerResponseSchema,
  donationLedgerItemSchema,
  DonationLedgerResponse,
  DonationLedgerItem,
} from "../schemas/donationSchema";

export async function fetchAdminDonations(
  page = 1,
  limit = 20,
  paymentStatus?: string,
  paymentMethod?: string,
  reconciliationStatus?: string
): Promise<DonationLedgerResponse> {
  const params: Record<string, string> = {
    page: page.toString(),
    limit: limit.toString(),
  };

  if (paymentStatus && paymentStatus !== "all") {
    params.payment_status = paymentStatus;
  }
  if (paymentMethod && paymentMethod !== "all") {
    params.payment_method = paymentMethod;
  }
  if (reconciliationStatus && reconciliationStatus !== "all") {
    params.reconciliation_status = reconciliationStatus;
  }

  return apiRequest("/api/v1/admin/donations", donationLedgerResponseSchema, {
    params,
  });
}

export async function confirmDonationReconciliation(
  id: string
): Promise<DonationLedgerItem> {
  return apiRequest(`/api/v1/admin/donations/${id}/reconcile-confirm`, donationLedgerItemSchema, {
    method: "PATCH",
  });
}
