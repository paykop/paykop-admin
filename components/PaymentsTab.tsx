// src/components/PaymentsTab.tsx
"use client";

import React, { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";

interface PaymentRecord {
  id: string;
  ref: string;
  user: string;
  type: string;
  amount: string;
  gateway: string;
  status: "Success" | "Refunded" | "Pending Refund";
}

export default function PaymentsTab() {
  const [payments, setPayments] = useState<PaymentRecord[]>([
    {
      id: "p1",
      ref: "#TX4821",
      user: "Aarav M.",
      type: "Order",
      amount: "₹480",
      gateway: "Razorpay",
      status: "Success",
    },
    {
      id: "p2",
      ref: "#TX4820",
      user: "Priya S.",
      type: "Donation",
      amount: "₹2,500",
      gateway: "Stripe",
      status: "Success",
    },
    {
      id: "p3",
      ref: "#TX4815",
      user: "Vikram K.",
      type: "Subscription",
      amount: "₹999",
      gateway: "Razorpay",
      status: "Pending Refund",
    },
  ]);

  const [refundCount, setRefundCount] = useState(7);

  const processRefund = (id: string) => {
    setPayments((prev) =>
      prev.map((payment) => {
        if (payment.id === id && payment.status === "Pending Refund") {
          setRefundCount((c) => Math.max(0, c - 1));
          return { ...payment, status: "Refunded" };
        }
        return payment;
      })
    );
  };

  const getStatusBadge = (status: PaymentRecord["status"]) => {
    if (status === "Success") {
      return (
        <span className="inline-flex px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-bold">
          Success
        </span>
      );
    }
    if (status === "Refunded") {
      return (
        <span className="inline-flex px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-bold">
          Refunded
        </span>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Payments</h2>
        <p className="text-sm text-slate-500 mt-0.5">Transaction history, refunds & reports</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1 */}
        <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Processed (30d)</span>
            <p className="text-3xl font-bold text-slate-900 tracking-tight mt-2">₹64.2L</p>
          </CardContent>
        </Card>
        {/* Metric 2 */}
        <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Refunds pending</span>
            <p className="text-3xl font-bold text-amber-500 tracking-tight mt-2">{refundCount}</p>
          </CardContent>
        </Card>
        {/* Metric 3 */}
        <Card className="bg-white border border-slate-200 rounded-2xl shadow-sm">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Success rate</span>
            <p className="text-3xl font-bold text-emerald-500 tracking-tight mt-2">98.6%</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="text-xs">
            <TableHeader className="bg-slate-50">
              <TableRow className="border-b border-slate-100 hover:bg-transparent">
                <TableHead className="p-4 pl-6 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Ref</TableHead>
                <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">User · Type</TableHead>
                <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Amount</TableHead>
                <TableHead className="p-4 text-slate-400 font-bold uppercase tracking-wider text-[10px]">Gateway</TableHead>
                <TableHead className="p-4 pr-6 text-right font-bold text-slate-400 uppercase tracking-wider text-[10px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {payments.map((p) => (
                <TableRow key={p.id} className="hover:bg-slate-50/50 transition border-b border-slate-100">
                  <TableCell className="p-4 pl-6 font-mono font-bold text-slate-500">{p.ref}</TableCell>
                  <TableCell className="p-4">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-slate-800">{p.user}</span>
                      <span className="text-[10px] text-slate-400 font-semibold mt-0.5">{p.type}</span>
                    </div>
                  </TableCell>
                  <TableCell className="p-4 text-slate-800 font-bold">{p.amount}</TableCell>
                  <TableCell className="p-4 text-slate-500 font-bold">{p.gateway}</TableCell>
                  <TableCell className="p-4 pr-6 text-right whitespace-nowrap">
                    {p.status === "Pending Refund" ? (
                      <Button
                        onClick={() => processRefund(p.id)}
                        variant="outline"
                        className="h-8 px-3 rounded-lg border border-blue-200 text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition font-bold text-xs cursor-pointer"
                      >
                        Refund
                      </Button>
                    ) : (
                      getStatusBadge(p.status)
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
