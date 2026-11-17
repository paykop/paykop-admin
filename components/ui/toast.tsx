// src/components/ui/toast.tsx
"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

type ToastListener = (toasts: ToastMessage[]) => void;

class ToastManager {
  private toasts: ToastMessage[] = [];
  private listeners: Set<ToastListener> = new Set();

  subscribe(listener: ToastListener) {
    this.listeners.add(listener);
    listener(this.toasts);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener([...this.toasts]));
  }

  show(type: ToastType, message: string, title?: string, duration = 4000) {
    const id = Math.random().toString(36).substring(2, 9);
    const toast: ToastMessage = { id, type, message, title, duration };
    this.toasts = [toast, ...this.toasts.slice(0, 4)]; // Max 5 visible toasts
    this.notify();

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }
    return id;
  }

  dismiss(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }

  success(message: string, title?: string, duration?: number) {
    return this.show("success", message, title || "Success", duration);
  }

  error(message: string, title?: string, duration?: number) {
    return this.show("error", message, title || "Error", duration);
  }

  warning(message: string, title?: string, duration?: number) {
    return this.show("warning", message, title || "Warning", duration);
  }

  info(message: string, title?: string, duration?: number) {
    return this.show("info", message, title || "Notice", duration);
  }
}

export const toast = new ToastManager();

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    return toast.subscribe((updatedToasts) => {
      setToasts(updatedToasts);
    });
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none p-2">
      {toasts.map((item) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
          info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
        };

        const bgStyles = {
          success: "border-emerald-200 bg-white/95 text-slate-800",
          error: "border-rose-200 bg-white/95 text-slate-800",
          warning: "border-amber-200 bg-white/95 text-slate-800",
          info: "border-blue-200 bg-white/95 text-slate-800",
        };

        return (
          <div
            key={item.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border shadow-xl backdrop-blur transition-all duration-200 animate-in fade-in slide-in-from-top-3 ${bgStyles[item.type]}`}
          >
            {icons[item.type]}
            <div className="flex-1 min-w-0">
              {item.title && <h4 className="text-xs font-bold text-slate-900 tracking-tight">{item.title}</h4>}
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed truncate-2-lines">{item.message}</p>
            </div>
            <button
              onClick={() => toast.dismiss(item.id)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
