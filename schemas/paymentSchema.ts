import { z } from "zod";

export const paymentItemSchema = z.object({
  id: z.number(),
  order_id: z.number().nullable().optional(),
  order_group_id: z.string().nullable().optional(),
  parent_payment_id: z.number().nullable().optional(),
  amount: z.number(),
  currency: z.string().optional().default("INR"),
  status: z.string(),
  provider: z.string().optional().default(""),
  provider_ref: z.string().nullable().optional(),
  razorpay_payment_id: z.string().nullable().optional(),
  payment_type: z.string().optional(),
  refund_status: z.string().optional(),
  refund_amount: z.number().optional(),
  created_at: z.string().optional(),
}).passthrough();

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
  order_group_id: z.string().nullable().optional(),
  parent_payment_id: z.number().nullable().optional(),
  buyer_id: z.string().optional().nullable(),
  seller_id: z.string().optional().nullable(),
  amount: z.number(),
  status: z.string(),
  provider: z.string().optional(),
  payment_type: z.string().optional(),
  created_at: z.string(),
}).passthrough();


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
