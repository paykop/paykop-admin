// src/components/NotificationPopover.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/lib/useAuth";
import { useNotificationStore } from "../store/useNotificationStore";
import { Bell, CheckCheck, Loader2, Sparkles, Inbox } from "lucide-react";

export default function NotificationPopover() {
  const { getToken } = useAuth();
  const { notifications, unreadCount, loading, fetchNotificationsList, markAsRead, markAllAsRead } =
    useNotificationStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotificationsList(getToken);
    // Poll for new in-app notifications every 30 seconds
    const timer = setInterval(() => {
      fetchNotificationsList(getToken);
    }, 30000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getToken]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer flex items-center justify-center border border-slate-200 bg-white shadow-sm"
        title="In-App Notifications"
      >
        <Bell className="w-4 h-4 text-slate-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center animate-pulse border-2 border-white shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Panel Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-blue-50 text-blue-600 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead(getToken)}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer transition"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {loading && notifications.length === 0 ? (
              <div className="p-8 flex justify-center items-center">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center gap-2 text-slate-400">
                <Inbox className="w-8 h-8 text-slate-300" />
                <p className="text-xs font-bold text-slate-600">No notifications yet</p>
                <p className="text-[11px] text-slate-400">You're all caught up on in-app updates!</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => !item.is_read && markAsRead(getToken, item.id)}
                  className={`p-3.5 transition flex items-start gap-3 cursor-pointer ${
                    item.is_read ? "bg-white hover:bg-slate-50/50" : "bg-blue-50/30 hover:bg-blue-50/50"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      item.is_read ? "bg-slate-200" : "bg-blue-600 shadow-sm shadow-blue-500/50"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xs font-bold truncate ${item.is_read ? "text-slate-700" : "text-slate-900"}`}>
                        {item.title}
                      </p>
                      {item.created_at && (
                        <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                          {new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed line-clamp-2">
                      {item.body}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
