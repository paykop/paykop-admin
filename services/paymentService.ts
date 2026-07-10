import { apiRequest } from "./apiService";
import {
  paymentListResponseSchema,
  refundResponseSchema,
  transactionReportResponseSchema,
  PaymentListResponse,
  RefundResponse,
  TransactionReportResponse,
} from "../schemas/paymentSchema";

/**
 * List platform payment intents (paginated)
 */
export async function fetchPayments(
  token: string,
  page = 1,
  limit = 10,
  status?: string,
  startDate?: string,
  endDate?: string
): Promise<PaymentListResponse> {
  const params: Record<string, string> = {
    page: page.toString(),
    limit: limit.toString(),
  };
  if (status) params.status = status;
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;

  return apiRequest("/api/v1/admin/payments", paymentListResponseSchema, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params,
  });
}

/**
 * Process a manual refund on a payment
 */
export async function processRefund(token: string, id: string | number): Promise<RefundResponse> {
  console.log(`[API] Processing refund for payment ID: ${id}`);
  return apiRequest(`/api/v1/admin/refunds/${id}`, refundResponseSchema, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Get the global transaction report
 */
export async function fetchTransactionReport(
  token: string,
  startDate?: string,
  endDate?: string
): Promise<TransactionReportResponse> {
  const params: Record<string, string> = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;

  return apiRequest("/api/v1/admin/reports/transactions", transactionReportResponseSchema, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params,
  });
}
