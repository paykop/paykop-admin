import { z } from "zod";

export const paymentItemSchema = z.object({
  id: z.number(),
  order_id: z.number().nullable().optional(),
  amount: z.number(),
  status: z.string(),
  payment_type: z.string(),
  refund_status: z.string().optional().default("none"),
  refund_amount: z.number().optional().default(0),
});

export const paymentListResponseSchema = z.object({
  payments: z.array(paymentItemSchema),
  total: z.number(),
});

export const refundResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
});

export const transactionItemSchema = z.object({
  payment_id: z.number(),
  order_id: z.number().nullable().optional(),
  amount: z.number(),
  status: z.string(),
  payment_type: z.string(),
  created_at: z.string(),
});

export const transactionReportResponseSchema = z.object({
  transactions: z.array(transactionItemSchema),
  total_amount: z.number(),
  count: z.number(),
});

export type PaymentItem = z.infer<typeof paymentItemSchema>;
export type PaymentListResponse = z.infer<typeof paymentListResponseSchema>;
export type RefundResponse = z.infer<typeof refundResponseSchema>;
export type TransactionItem = z.infer<typeof transactionItemSchema>;
export type TransactionReportResponse = z.infer<typeof transactionReportResponseSchema>;
