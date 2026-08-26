// src/store/useNotificationStore.ts
import { create } from "zustand";
import { NotificationItem } from "../schemas/notificationSchema";
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/notificationService";

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  error: string | null;

  fetchNotificationsList: (getToken: () => Promise<string | null>) => Promise<void>;
  markAsRead: (getToken: () => Promise<string | null>, id: number) => Promise<void>;
  markAllAsRead: (getToken: () => Promise<string | null>) => Promise<void>;
}

import { toast } from "../components/ui/toast";

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,

  fetchNotificationsList: async (getToken) => {
    set({ loading: true, error: null });
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetchNotifications(token);
      const list = res.notifications || [];
      const unread = list.filter((n) => !n.is_read).length;

      // Trigger toast for newly received unread notifications
      const prevIds = new Set(get().notifications.map((n) => n.id));
      if (get().notifications.length > 0) {
        const newUnread = list.filter((n) => !n.is_read && !prevIds.has(n.id));
        newUnread.forEach((item) => {
          toast.info(item.body, item.title);
        });
      }

      set({ notifications: list, unreadCount: unread, error: null });
    } catch (err: any) {
      console.warn("[NotificationStore] Failed to fetch notifications", err);
      // Graceful fallback for un-deployed endpoint
      set({ notifications: [], unreadCount: 0 });
    } finally {
      set({ loading: false });
    }
  },

  markAsRead: async (getToken, id) => {
    try {
      const token = await getToken();
      if (!token) return;
      await markNotificationAsRead(token, id);
      set((state) => {
        const updated = state.notifications.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        );
        return {
          notifications: updated,
          unreadCount: updated.filter((n) => !n.is_read).length,
        };
      });
    } catch (err) {
      console.error("[NotificationStore] Failed to mark notification as read", err);
    }
  },

  markAllAsRead: async (getToken) => {
    try {
      const token = await getToken();
      if (!token) return;
      await markAllNotificationsAsRead(token);
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
        unreadCount: 0,
      }));
    } catch (err) {
      console.error("[NotificationStore] Failed to mark all notifications as read", err);
    }
  },
}));
